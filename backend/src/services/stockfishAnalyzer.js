const { Chess } = require('chess.js');
const db = require('../db/connection');
const logger = require('../utils/logger');
const config = require('../config');

class StockfishAnalyzer {
  constructor() {
    this.engine = null;
    this.engineReady = false;
    this.initializeEngine();
  }

  /**
   * Initialize Stockfish engine
   */
  async initializeEngine() {
    try {
      // Note: This is a simplified version. In production, you'd use stockfish.wasm
      // or spawn a native Stockfish process
      logger.info('Stockfish analyzer initialized (using chess.js for demo)');
      this.engineReady = true;
    } catch (error) {
      logger.error('Failed to initialize Stockfish', { error });
    }
  }

  /**
   * Analyze a position and return evaluation
   */
  async analyzePosition(fen, depth = 20) {
    // Check cache first
    const cached = await this.getCachedAnalysis(fen, depth);
    if (cached) {
      return cached;
    }

    // For demo purposes, we'll use a simplified analysis
    // In production, this would use actual Stockfish
    const analysis = await this.performAnalysis(fen, depth);

    // Cache the result
    await this.cacheAnalysis(fen, depth, analysis);

    return analysis;
  }

  /**
   * Perform actual analysis (simplified for demo)
   */
  async performAnalysis(fen, depth) {
    try {
      const chess = new Chess(fen);

      // Simplified evaluation based on material and position
      const evaluation = this.evaluatePosition(chess);

      const moves = chess.moves({ verbose: true });
      const bestMove = moves.length > 0 ? moves[0].san : null;

      return {
        fen,
        depth,
        score_cp: Math.round(evaluation * 100), // Centipawns
        score_mate: null,
        best_move: bestMove,
        pv: bestMove, // Principal variation (simplified)
        engine_version: 'Stockfish 16 (demo)',
      };
    } catch (error) {
      logger.error('Analysis error', { error, fen });
      return {
        fen,
        depth,
        score_cp: 0,
        score_mate: null,
        best_move: null,
        pv: null,
        engine_version: 'error',
      };
    }
  }

  /**
   * Simple position evaluation (material-based)
   */
  evaluatePosition(chess) {
    const pieceValues = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let score = 0;
    const board = chess.board();

    for (let row of board) {
      for (let square of row) {
        if (square) {
          const value = pieceValues[square.type];
          score += square.color === 'w' ? value : -value;
        }
      }
    }

    // Add small random factor for variety
    score += (Math.random() - 0.5) * 0.5;

    return score;
  }

  /**
   * Batch analyze multiple positions
   */
  async batchAnalyze(positions, depth = 20, onProgress = null) {
    const results = [];
    const total = positions.length;

    for (let i = 0; i < total; i++) {
      const analysis = await this.analyzePosition(positions[i], depth);
      results.push(analysis);

      if (onProgress) {
        onProgress((i + 1) / total);
      }
    }

    return results;
  }

  /**
   * Get depth based on time control
   */
  getDepthForTimeControl(timeControl) {
    const depths = {
      bullet: config.analysis.stockfish.depthBlitz - 5,
      blitz: config.analysis.stockfish.depthBlitz,
      rapid: config.analysis.stockfish.depthRapid,
      classical: config.analysis.stockfish.depthClassical,
      correspondence: config.analysis.stockfish.depthClassical + 5,
    };

    return depths[timeControl] || config.analysis.stockfish.depthBlitz;
  }

  /**
   * Get cached analysis
   */
  async getCachedAnalysis(fen, depth) {
    try {
      const result = await db.query(
        `SELECT * FROM engine_cache
         WHERE fen = $1 AND depth >= $2
         AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY depth DESC
         LIMIT 1`,
        [fen, depth]
      );

      if (result.rows.length > 0) {
        const cached = result.rows[0];

        // Update access stats
        await db.query(
          `UPDATE engine_cache
           SET access_count = access_count + 1,
               last_accessed_at = NOW()
           WHERE id = $1`,
          [cached.id]
        );

        return {
          fen: cached.fen,
          depth: cached.depth,
          score_cp: cached.score_cp,
          score_mate: cached.score_mate,
          best_move: cached.best_move,
          pv: cached.pv,
          engine_version: cached.engine_version,
        };
      }

      return null;
    } catch (error) {
      logger.warn('Cache lookup failed', { error });
      return null;
    }
  }

  /**
   * Cache analysis result
   */
  async cacheAnalysis(fen, depth, analysis) {
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.query(
        `INSERT INTO engine_cache
         (fen, depth, score_cp, score_mate, best_move, pv, engine_version, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (fen) DO UPDATE
         SET depth = GREATEST(engine_cache.depth, $2),
             score_cp = $3,
             score_mate = $4,
             best_move = $5,
             pv = $6,
             engine_version = $7,
             expires_at = $8,
             access_count = engine_cache.access_count + 1,
             last_accessed_at = NOW()`,
        [
          fen,
          depth,
          analysis.score_cp,
          analysis.score_mate,
          analysis.best_move,
          analysis.pv,
          analysis.engine_version,
          expiresAt,
        ]
      );
    } catch (error) {
      logger.warn('Failed to cache analysis', { error });
    }
  }

  /**
   * Detect tactical motifs in a position
   */
  async detectTacticalMotifs(fen) {
    const chess = new Chess(fen);
    const motifs = [];

    // Check for checks
    if (chess.isCheck()) {
      motifs.push('check');
    }

    // Check for checkmate
    if (chess.isCheckmate()) {
      motifs.push('checkmate');
    }

    // Check for stalemate
    if (chess.isStalemate()) {
      motifs.push('stalemate');
    }

    // Simplified pattern detection
    // In production, you'd use more sophisticated pattern recognition

    return motifs;
  }
}

module.exports = new StockfishAnalyzer();
