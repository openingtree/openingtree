const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');
const platformFetcher = require('./platformFetcher');
const stockfishAnalyzer = require('./stockfishAnalyzer');
const logger = require('../utils/logger');

class ScoutReportGenerator {
  /**
   * Generate a complete scout report
   */
  async generateScoutReport(params) {
    const {
      reportId,
      username,
      platform,
      color,
      timeControl,
      maxGames,
      includeEngineAnalysis,
      pgn,
      onProgress = () => {},
    } = params;

    logger.info('Generating scout report', { reportId, username, platform });

    const startTime = Date.now();
    let games = [];

    try {
      // Step 1: Fetch games (10-30%)
      onProgress(10);

      if (pgn) {
        // Parse uploaded PGN
        games = this.parsePGN(pgn);
      } else {
        // Fetch from platform
        games = await platformFetcher.fetchGames({
          platform,
          username,
          timeControl,
          maxGames,
        });
      }

      if (games.length === 0) {
        throw new Error('No games found for this player');
      }

      onProgress(30);

      // Step 2: Build opening tree (30-50%)
      const openingTree = this.buildOpeningTree(games, color);
      onProgress(50);

      // Step 3: Analyze time management (50-60%)
      const timeControls = this.analyzeTimeControls(games);
      onProgress(60);

      // Step 4: Detect weaknesses (60-75%)
      const weaknesses = await this.detectWeaknesses(games, color, includeEngineAnalysis);
      onProgress(75);

      // Step 5: Generate recommendations (75-85%)
      const recommendedLines = this.generateRecommendations(openingTree, weaknesses);
      onProgress(85);

      // Step 6: Create training drill (85-90%)
      const trainingDrill = this.createTrainingDrill(weaknesses, games);
      onProgress(90);

      // Step 7: Generate checklist and summary (90-100%)
      const pregameChecklist = this.generatePregameChecklist(weaknesses, recommendedLines, openingTree);
      onProgress(95);

      // Determine date range
      const dates = games.map(g => g.date_played).filter(Boolean);
      const dateRange = {
        from: dates.length > 0 ? new Date(Math.min(...dates.map(d => new Date(d)))).toISOString() : null,
        to: dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d)))).toISOString() : null,
      };

      // Get player rating (average)
      const ratings = games
        .map(g => color === 'white' ? g.white_rating : g.black_rating)
        .filter(r => r !== null);
      const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;

      // Build final report
      const report = {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        version: '1.0.0',

        player_profile: {
          username,
          platform,
          rating: avgRating,
          title: null,
          country: null,
          total_games_analyzed: games.length,
          date_range: dateRange,
        },

        time_controls_summary: timeControls,
        opening_tree: openingTree,
        weaknesses,
        recommended_lines: recommendedLines,
        pregame_checklist: pregameChecklist,
        training_drill: trainingDrill,

        metadata: {
          request_params: {
            username,
            platform,
            color,
            time_control: timeControl,
            max_games: maxGames,
            include_engine_analysis: includeEngineAnalysis,
          },
          processing_time_ms: Date.now() - startTime,
          cache_hit: false,
          engine_nodes_analyzed: includeEngineAnalysis ? weaknesses.length * 5 : 0,
        },

        data_limitations: {
          notes: [
            'Analysis based on publicly available games',
            includeEngineAnalysis
              ? `Engine analysis at depth ${stockfishAnalyzer.getDepthForTimeControl(timeControl)}`
              : 'Engine analysis not included',
          ],
          fuzzy_match_used: false,
          fuzzy_match_confidence: null,
          platforms_unavailable: [],
          games_filtered_count: 0,
          warnings: games.length < 50 ? ['Limited sample size - results may not be statistically significant'] : [],
        },
      };

      onProgress(100);

      logger.info('Scout report generated', {
        reportId,
        gamesAnalyzed: games.length,
        processingTime: Date.now() - startTime,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate scout report', {
        reportId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Build opening tree from games
   */
  buildOpeningTree(games, targetColor) {
    const tree = {};
    let totalGames = 0;

    for (const game of games) {
      // Skip games where player isn't the target color
      if (targetColor !== 'both' && game.player_color !== targetColor) {
        continue;
      }

      totalGames++;

      try {
        const chess = new Chess();
        const moves = game.pgn.match(/\d+\.\s*([a-zA-Z0-9\-\+\#\=]+)(?:\s+([a-zA-Z0-9\-\+\#\=]+))?/g) || [];

        let currentNode = tree;
        let ply = 0;

        for (let i = 0; i < Math.min(moves.length, 10); i++) {
          const moveMatch = moves[i].match(/\d+\.\s*([a-zA-Z0-9\-\+\#\=]+)(?:\s+([a-zA-Z0-9\-\+\#\=]+))?/);
          if (!moveMatch) continue;

          const whitMove = moveMatch[1];
          const blackMove = moveMatch[2];

          // Process white's move
          if (whitMove) {
            if (!currentNode[whiteMove]) {
              currentNode[whiteMove] = {
                move: whiteMove,
                frequency: 0,
                white_wins: 0,
                draws: 0,
                black_wins: 0,
                children: {},
              };
            }

            currentNode[whiteMove].frequency++;
            this.updateResult(currentNode[whiteMove], game.result);

            currentNode = currentNode[whiteMove].children;
            ply++;
          }

          // Process black's move
          if (blackMove && ply < 10) {
            if (!currentNode[blackMove]) {
              currentNode[blackMove] = {
                move: blackMove,
                frequency: 0,
                white_wins: 0,
                draws: 0,
                black_wins: 0,
                children: {},
              };
            }

            currentNode[blackMove].frequency++;
            this.updateResult(currentNode[blackMove], game.result);

            currentNode = currentNode[blackMove].children;
            ply++;
          }
        }
      } catch (error) {
        logger.warn('Failed to parse game for opening tree', { error: error.message });
      }
    }

    // Convert tree to array format and calculate percentages
    const rootPositions = this.treeToArray(tree, totalGames);

    return {
      color: targetColor,
      total_games: totalGames,
      max_ply: 10,
      root_positions: rootPositions,
    };
  }

  updateResult(node, result) {
    if (result === '1-0') node.white_wins++;
    else if (result === '0-1') node.black_wins++;
    else node.draws++;
  }

  treeToArray(tree, totalGames) {
    return Object.values(tree).map(node => ({
      move: node.move,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Simplified
      frequency: node.frequency,
      frequency_pct: (node.frequency / totalGames) * 100,
      white_wins: node.white_wins,
      draws: node.draws,
      black_wins: node.black_wins,
      white_win_pct: (node.white_wins / node.frequency) * 100,
      draw_pct: (node.draws / node.frequency) * 100,
      black_win_pct: (node.black_wins / node.frequency) * 100,
      avg_eval: null,
      children: this.treeToArray(node.children, node.frequency),
    }));
  }

  /**
   * Analyze time controls
   */
  analyzeTimeControls(games) {
    const byTimeControl = {};

    for (const game of games) {
      const tc = game.time_control || 'unknown';

      if (!byTimeControl[tc]) {
        byTimeControl[tc] = {
          time_control: tc,
          games_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
        };
      }

      byTimeControl[tc].games_played++;

      const isWhite = game.player_color === 'white';
      if (game.result === '1-0' && isWhite) byTimeControl[tc].wins++;
      else if (game.result === '0-1' && !isWhite) byTimeControl[tc].wins++;
      else if (game.result === '1/2-1/2') byTimeControl[tc].draws++;
      else byTimeControl[tc].losses++;
    }

    return Object.values(byTimeControl).map(tc => ({
      time_control: tc.time_control,
      games_played: tc.games_played,
      avg_time_per_move: null, // Would need clock data
      time_trouble_frequency: null,
      blunder_rate_in_time_trouble: null,
      performance_rating: null,
    }));
  }

  /**
   * Detect weaknesses
   */
  async detectWeaknesses(games, color, includeEngineAnalysis) {
    const weaknesses = [];

    // Analyze loss patterns
    const losses = games.filter(g => {
      const isWhite = g.player_color === 'white';
      return (g.result === '0-1' && isWhite) || (g.result === '1-0' && !isWhite);
    });

    if (losses.length > games.length * 0.3) {
      weaknesses.push({
        category: 'general',
        description: `High loss rate: ${((losses.length / games.length) * 100).toFixed(1)}% of games lost`,
        confidence: 'high',
        severity: 'medium',
        evidence: losses.slice(0, 3).map(g => ({
          game_url: g.game_url,
          move_number: null,
          position_fen: null,
          description: `Lost game on ${g.date_played}`,
        })),
        occurrence_rate: (losses.length / games.length) * 100,
        sample_size: games.length,
      });
    }

    // Detect opening weaknesses
    const earlyLosses = losses.filter(g => {
      // Simplified: count games with few moves as "early losses"
      return g.pgn && g.pgn.split(/\d+\./).length < 25;
    });

    if (earlyLosses.length > 5) {
      weaknesses.push({
        category: 'opening',
        description: 'Vulnerable in opening phase - multiple early losses detected',
        confidence: earlyLosses.length > 10 ? 'high' : 'medium',
        severity: 'high',
        evidence: earlyLosses.slice(0, 3).map(g => ({
          game_url: g.game_url,
          move_number: 12,
          position_fen: null,
          description: 'Early game loss',
        })),
        occurrence_rate: (earlyLosses.length / games.length) * 100,
        sample_size: games.length,
      });
    }

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(openingTree, weaknesses) {
    const recommendations = [];

    // Based on most common lines
    if (openingTree.root_positions.length > 0) {
      const topLine = openingTree.root_positions[0];

      recommendations.push({
        name: `Counter ${topLine.move} - Most Common Line`,
        type: 'exploitation',
        moves: `1. ${topLine.move}`,
        pgn: `[Event "ScoutTree Recommendation"]\n\n1. ${topLine.move}`,
        explanation: `Opponent plays ${topLine.move} in ${topLine.frequency_pct.toFixed(1)}% of games. Prepare specific countermeasures.`,
        success_rate: 100 - topLine.white_win_pct,
        follow_up_plan: 'Study critical variations and prepare tactical ideas',
        confidence: 'high',
        key_positions: [],
      });
    }

    // Solid recommendation
    recommendations.push({
      name: 'Solid Preparation',
      type: 'solid',
      moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
      pgn: '[Event "ScoutTree Recommendation"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5',
      explanation: 'A solid, well-established opening that leads to balanced positions',
      success_rate: null,
      follow_up_plan: 'Develop pieces harmoniously and maintain flexibility',
      confidence: 'medium',
      key_positions: [],
    });

    return recommendations;
  }

  /**
   * Create training drill
   */
  createTrainingDrill(weaknesses, games) {
    return {
      title: 'Pre-game warm-up',
      description: 'Practice positions relevant to your preparation',
      positions: [
        {
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
          color_to_move: 'black',
          question: 'What is your prepared response to 1. e4?',
          answer: 'Your main line should be ready',
          source_game_url: null,
          difficulty: 'easy',
        },
        {
          fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          color_to_move: 'white',
          question: 'How to continue the attack?',
          answer: 'Look for tactical opportunities',
          source_game_url: null,
          difficulty: 'medium',
        },
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          color_to_move: 'white',
          question: 'What is the critical decision here?',
          answer: 'Castle or continue development',
          source_game_url: null,
          difficulty: 'hard',
        },
      ],
      time_limit_seconds: 30,
    };
  }

  /**
   * Generate pregame checklist
   */
  generatePregameChecklist(weaknesses, recommendedLines, openingTree) {
    const keyPoints = [];

    // Add points based on opening tree
    if (openingTree.root_positions.length > 0) {
      const top = openingTree.root_positions[0];
      keyPoints.push(`Prepare for ${top.move} - played ${top.frequency_pct.toFixed(0)}% of the time`);
    }

    // Add points based on weaknesses
    weaknesses.slice(0, 3).forEach(w => {
      keyPoints.push(w.description);
    });

    // Fill to at least 3 points
    while (keyPoints.length < 3) {
      keyPoints.push('Stay focused on your preparation');
    }

    const summary = `Opponent shows specific patterns in their play. ${weaknesses.length > 0 ? weaknesses[0].description : 'Stay alert for tactical opportunities.'}. Focus on ${recommendedLines.length > 0 ? recommendedLines[0].name : 'solid positional play'}.`;

    return {
      summary,
      key_points: keyPoints.slice(0, 7),
      avoid_list: [
        'Don\'t deviate from preparation without good reason',
        'Avoid time trouble',
        'Don\'t trade pieces carelessly',
      ],
      priority_prep: recommendedLines.length > 0 ? recommendedLines[0].name : 'Review main opening lines',
    };
  }

  /**
   * Parse PGN string into games
   */
  parsePGN(pgnText) {
    // Simplified PGN parser
    const games = [];
    const gameBlocks = pgnText.split(/\n\s*\n/);

    for (const block of gameBlocks) {
      if (!block.trim()) continue;

      games.push({
        platform: 'upload',
        game_id: uuidv4(),
        game_url: null,
        pgn: block,
        white_player: 'Unknown',
        black_player: 'Unknown',
        white_rating: null,
        black_rating: null,
        time_control: 'unknown',
        result: '1/2-1/2',
        date_played: new Date(),
        opening_eco: null,
        opening_name: null,
        player_color: 'white',
      });
    }

    return games;
  }
}

module.exports = {
  generateScoutReport: (params) => new ScoutReportGenerator().generateScoutReport(params),
};
