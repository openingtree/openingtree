const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const db = require('../../db/connection');
const logger = require('../../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { scoutQueue } = require('../../workers/scoutQueue');
const { sampleScoutReport } = require('../../utils/scoutReportSchema');

// Validation schema for scout request
const scoutRequestSchema = Joi.object({
  username: Joi.string().required().min(2).max(100),
  platform: Joi.string().valid('lichess', 'chess.com', 'auto').default('auto'),
  color: Joi.string().valid('white', 'black', 'both').default('both'),
  time_control: Joi.string().valid('bullet', 'blitz', 'rapid', 'classical', 'correspondence', 'all').allow(null),
  max_games: Joi.number().integer().min(10).max(1000).default(500),
  include_engine_analysis: Joi.boolean().default(true),
});

/**
 * POST /api/v1/scout
 * Create a scout report request
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = scoutRequestSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const {
      username,
      platform,
      color,
      time_control,
      max_games,
      include_engine_analysis,
    } = value;

    const userId = req.user.id;

    // Check cache first
    const cacheKey = `${platform}:${username}:${color}:${time_control}`;
    const cachedReport = await db.query(
      `SELECT * FROM scout_reports
       WHERE target_username = $1
       AND target_platform = $2
       AND target_color = $3
       AND (target_time_control = $4 OR ($4 IS NULL AND target_time_control IS NULL))
       AND status = 'completed'
       AND deleted_at IS NULL
       AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      [username, platform, color, time_control]
    );

    if (cachedReport.rows.length > 0) {
      logger.info('Cache hit for scout report', { username, platform });

      return res.json({
        success: true,
        data: {
          report_id: cachedReport.rows[0].id,
          status: 'completed',
          cache_hit: true,
          report: cachedReport.rows[0].report_data,
        },
      });
    }

    // Create report record
    const reportId = uuidv4();
    const jobId = `scout_${reportId}`;

    const report = await db.insert('scout_reports', {
      id: reportId,
      user_id: userId,
      target_username: username,
      target_platform: platform,
      target_color: color,
      target_time_control: time_control,
      max_games_requested: max_games,
      include_engine_analysis,
      status: 'pending',
      job_id: jobId,
    });

    // Increment usage counter
    await db.query(
      'UPDATE users SET reports_used_this_month = reports_used_this_month + 1 WHERE id = $1',
      [userId]
    );

    // Add to job queue
    await scoutQueue.add({
      reportId,
      userId,
      username,
      platform,
      color,
      timeControl: time_control,
      maxGames: max_games,
      includeEngineAnalysis: include_engine_analysis,
    }, {
      jobId,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    logger.info('Scout report queued', { reportId, username, platform });

    // Log usage
    await db.insert('usage_logs', {
      user_id: userId,
      action: 'scout_report_created',
      resource_type: 'scout_report',
      resource_id: reportId,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    res.status(202).json({
      success: true,
      data: {
        report_id: reportId,
        job_id: jobId,
        status: 'pending',
        message: 'Report generation started',
        estimated_time_seconds: 120,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/scout/:jobId
 * Get status and result of a scout report job
 */
router.get('/:jobId', authenticate, async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Get report
    const result = await db.query(
      'SELECT * FROM scout_reports WHERE job_id = $1',
      [jobId]
    );

    if (result.rows.length === 0) {
      // Try by report ID
      const byId = await db.query(
        'SELECT * FROM scout_reports WHERE id = $1',
        [jobId]
      );

      if (byId.rows.length === 0) {
        throw new AppError('Report not found', 404);
      }

      result.rows[0] = byId.rows[0];
    }

    const report = result.rows[0];

    // Check authorization
    if (report.user_id !== req.user.id && !req.user.is_admin) {
      throw new AppError('Unauthorized', 403);
    }

    // Build response based on status
    const response = {
      success: true,
      data: {
        report_id: report.id,
        job_id: report.job_id,
        status: report.status,
        created_at: report.created_at,
      },
    };

    if (report.status === 'completed') {
      response.data.completed_at = report.completed_at;
      response.data.processing_time_ms = report.processing_time_ms;
      response.data.report = report.report_data;
    } else if (report.status === 'processing') {
      response.data.message = 'Report is being generated';
    } else if (report.status === 'failed') {
      response.data.error = report.error_message;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/scout/report/:reportId
 * Download a specific report
 */
router.get('/report/:reportId', authenticate, async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const result = await db.query(
      'SELECT * FROM scout_reports WHERE id = $1 AND deleted_at IS NULL',
      [reportId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Report not found', 404);
    }

    const report = result.rows[0];

    // Check authorization
    if (report.user_id !== req.user.id && !report.is_public && !req.user.is_admin) {
      throw new AppError('Unauthorized', 403);
    }

    if (report.status !== 'completed') {
      throw new AppError('Report not yet completed', 400);
    }

    res.json({
      success: true,
      data: report.report_data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/scout/upload-pgn
 * Upload PGN file for analysis
 */
router.post('/upload-pgn', authenticate, async (req, res, next) => {
  try {
    const { pgn, color, includeEngineAnalysis } = req.body;

    if (!pgn) {
      throw new AppError('PGN content required', 400);
    }

    // Create a report with uploaded PGN
    const reportId = uuidv4();
    const jobId = `scout_pgn_${reportId}`;

    const report = await db.insert('scout_reports', {
      id: reportId,
      user_id: req.user.id,
      target_username: 'pgn_upload',
      target_platform: 'upload',
      target_color: color || 'both',
      max_games_requested: 9999,
      include_engine_analysis: includeEngineAnalysis !== false,
      status: 'pending',
      job_id: jobId,
    });

    // Add to queue with PGN data
    await scoutQueue.add({
      reportId,
      userId: req.user.id,
      pgn,
      color: color || 'both',
      includeEngineAnalysis: includeEngineAnalysis !== false,
    }, {
      jobId,
      attempts: 3,
    });

    // Increment usage
    await db.query(
      'UPDATE users SET reports_used_this_month = reports_used_this_month + 1 WHERE id = $1',
      [req.user.id]
    );

    res.status(202).json({
      success: true,
      data: {
        report_id: reportId,
        job_id: jobId,
        status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/scout/search-match
 * Fuzzy search for usernames
 */
router.get('/search-match', authenticate, async (req, res, next) => {
  try {
    const { name, platform = 'lichess' } = req.query;

    if (!name) {
      throw new AppError('Name parameter required', 400);
    }

    // Check cache first
    const cached = await db.findOne('username_matches', {
      platform,
      search_query: name.toLowerCase(),
    });

    if (cached && new Date(cached.expires_at) > new Date()) {
      return res.json({
        success: true,
        data: {
          matches: cached.matches,
          cache_hit: true,
        },
      });
    }

    // TODO: Implement actual fuzzy matching with platform API
    // For now, return sample data
    const matches = [
      {
        username: name,
        platform,
        confidence: 100,
        rating: 2000,
      },
    ];

    // Cache the results
    await db.query(
      `INSERT INTO username_matches (platform, search_query, matches, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')
       ON CONFLICT (platform, search_query)
       DO UPDATE SET matches = $3, expires_at = NOW() + INTERVAL '7 days'`,
      [platform, name.toLowerCase(), JSON.stringify(matches)]
    );

    res.json({
      success: true,
      data: { matches },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/scout/demo
 * Get a sample/demo report
 */
router.get('/demo', async (req, res) => {
  res.json({
    success: true,
    data: sampleScoutReport,
    message: 'This is a demo report with synthetic data',
  });
});

module.exports = router;
