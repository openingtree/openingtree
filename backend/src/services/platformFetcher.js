const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const db = require('../db/connection');

class PlatformFetcher {
  constructor() {
    this.retryDelay = 2000;
    this.maxRetries = 4;
  }

  /**
   * Fetch games from specified platform
   */
  async fetchGames({ platform, username, timeControl, maxGames = 500 }) {
    logger.info('Fetching games', { platform, username, timeControl, maxGames });

    // Check cache first
    const cacheKey = `${platform}:${username}`;
    const cachedGames = await this.getCachedGames(platform, username);

    if (cachedGames && cachedGames.length > 0) {
      logger.info('Using cached games', { count: cachedGames.length });
      return this.filterByTimeControl(cachedGames, timeControl).slice(0, maxGames);
    }

    // Fetch from platform
    let games = [];
    if (platform === 'lichess' || platform === 'auto') {
      try {
        games = await this.fetchFromLichess(username, maxGames);
      } catch (error) {
        logger.warn('Lichess fetch failed', { error: error.message });
        if (platform === 'auto') {
          // Try Chess.com
          games = await this.fetchFromChessCom(username, maxGames);
        } else {
          throw error;
        }
      }
    } else if (platform === 'chess.com') {
      games = await this.fetchFromChessCom(username, maxGames);
    }

    // Cache the games
    await this.cacheGames(platform, username, games);

    // Filter by time control
    const filtered = this.filterByTimeControl(games, timeControl);

    return filtered.slice(0, maxGames);
  }

  /**
   * Fetch games from Lichess API
   */
  async fetchFromLichess(username, maxGames) {
    const url = `${config.platforms.lichess.apiUrl}/api/games/user/${username}`;

    const response = await this.retryRequest(() =>
      axios.get(url, {
        headers: {
          Accept: 'application/x-ndjson',
        },
        params: {
          max: maxGames,
          pgnInJson: true,
          clocks: true,
          evals: false,
          opening: true,
        },
      })
    );

    // Parse NDJSON response
    const games = response.data
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(game => game !== null);

    logger.info(`Fetched ${games.length} games from Lichess`);

    return games.map(game => this.normalizeGame(game, 'lichess', username));
  }

  /**
   * Fetch games from Chess.com API
   */
  async fetchFromChessCom(username, maxGames) {
    const baseUrl = config.platforms.chesscom.apiUrl;

    // Get archives list
    const archivesUrl = `${baseUrl}/player/${username}/games/archives`;
    const archivesResponse = await this.retryRequest(() => axios.get(archivesUrl));

    const archives = archivesResponse.data.archives || [];

    // Fetch games from most recent archives
    const allGames = [];
    const sortedArchives = archives.sort().reverse(); // Most recent first

    for (const archiveUrl of sortedArchives) {
      if (allGames.length >= maxGames) break;

      await this.sleep(1000); // Rate limiting

      try {
        const response = await this.retryRequest(() => axios.get(archiveUrl));
        const games = response.data.games || [];

        for (const game of games) {
          if (allGames.length >= maxGames) break;
          allGames.push(this.normalizeGame(game, 'chess.com', username));
        }
      } catch (error) {
        logger.warn('Failed to fetch archive', { archiveUrl, error: error.message });
      }
    }

    logger.info(`Fetched ${allGames.length} games from Chess.com`);
    return allGames;
  }

  /**
   * Normalize game data from different platforms
   */
  normalizeGame(game, platform, username) {
    if (platform === 'lichess') {
      return {
        platform: 'lichess',
        game_id: game.id,
        game_url: `https://lichess.org/${game.id}`,
        pgn: game.pgn || '',
        white_player: game.players?.white?.user?.name || 'Unknown',
        black_player: game.players?.black?.user?.name || 'Unknown',
        white_rating: game.players?.white?.rating || null,
        black_rating: game.players?.black?.rating || null,
        time_control: this.classifyTimeControl(game.speed),
        result: game.status === 'resign' || game.status === 'mate' || game.status === 'outoftime'
          ? (game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '1/2-1/2')
          : '1/2-1/2',
        date_played: game.createdAt ? new Date(game.createdAt) : null,
        opening_eco: game.opening?.eco || null,
        opening_name: game.opening?.name || null,
        player_color: game.players?.white?.user?.name?.toLowerCase() === username.toLowerCase() ? 'white' : 'black',
      };
    } else if (platform === 'chess.com') {
      const isWhite = game.white?.username?.toLowerCase() === username.toLowerCase();

      return {
        platform: 'chess.com',
        game_id: game.url?.split('/').pop() || '',
        game_url: game.url || '',
        pgn: game.pgn || '',
        white_player: game.white?.username || 'Unknown',
        black_player: game.black?.username || 'Unknown',
        white_rating: game.white?.rating || null,
        black_rating: game.black?.rating || null,
        time_control: this.classifyTimeControl(game.time_class),
        result: game.white?.result === 'win' ? '1-0' : game.black?.result === 'win' ? '0-1' : '1/2-1/2',
        date_played: game.end_time ? new Date(game.end_time * 1000) : null,
        opening_eco: null,
        opening_name: null,
        player_color: isWhite ? 'white' : 'black',
      };
    }

    return null;
  }

  /**
   * Classify time control
   */
  classifyTimeControl(speed) {
    if (!speed) return 'unknown';

    const speedLower = speed.toLowerCase();

    if (speedLower.includes('bullet') || speedLower === 'bullet') return 'bullet';
    if (speedLower.includes('blitz') || speedLower === 'blitz') return 'blitz';
    if (speedLower.includes('rapid') || speedLower === 'rapid') return 'rapid';
    if (speedLower.includes('classical') || speedLower === 'classical') return 'classical';
    if (speedLower.includes('correspondence') || speedLower === 'correspondence') return 'correspondence';

    // Fallback
    return speedLower;
  }

  /**
   * Filter games by time control
   */
  filterByTimeControl(games, timeControl) {
    if (!timeControl || timeControl === 'all') return games;

    return games.filter(game => game.time_control === timeControl);
  }

  /**
   * Get cached games
   */
  async getCachedGames(platform, username) {
    const result = await db.query(
      `SELECT * FROM games_cache
       WHERE platform = $1 AND username = $2
       AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY date_played DESC`,
      [platform, username]
    );

    return result.rows.map(row => ({
      platform: row.platform,
      game_id: row.game_id,
      game_url: row.game_url,
      pgn: row.pgn,
      white_player: row.white_player,
      black_player: row.black_player,
      white_rating: row.white_rating,
      black_rating: row.black_rating,
      time_control: row.time_control,
      result: row.result,
      date_played: row.date_played,
      opening_eco: row.opening_eco,
      opening_name: row.opening_name,
      player_color: row.player_color,
    }));
  }

  /**
   * Cache games in database
   */
  async cacheGames(platform, username, games) {
    const expiresAt = new Date(Date.now() + config.analysis.cacheTtlGames * 1000);

    for (const game of games) {
      try {
        await db.query(
          `INSERT INTO games_cache
           (platform, username, game_id, game_url, pgn, white_player, black_player,
            white_rating, black_rating, time_control, result, date_played,
            opening_eco, opening_name, player_color, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (platform, game_id) DO NOTHING`,
          [
            platform,
            username,
            game.game_id,
            game.game_url,
            game.pgn,
            game.white_player,
            game.black_player,
            game.white_rating,
            game.black_rating,
            game.time_control,
            game.result,
            game.date_played,
            game.opening_eco,
            game.opening_name,
            game.player_color,
            expiresAt,
          ]
        );
      } catch (error) {
        logger.warn('Failed to cache game', { gameId: game.game_id, error: error.message });
      }
    }

    logger.info('Games cached', { count: games.length, platform, username });
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(requestFn) {
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (error.response?.status === 429) {
          // Rate limited
          const delay = this.retryDelay * Math.pow(2, attempt);
          logger.warn(`Rate limited, retrying in ${delay}ms`, { attempt });
          await this.sleep(delay);
        } else if (error.response?.status >= 500) {
          // Server error
          const delay = this.retryDelay * Math.pow(2, attempt);
          logger.warn(`Server error, retrying in ${delay}ms`, { attempt });
          await this.sleep(delay);
        } else {
          // Other errors - don't retry
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PlatformFetcher();
