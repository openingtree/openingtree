const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const db = require('../../db/connection');
const { scoutQueue } = require('../../workers/scoutQueue');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/stats
 * Get system statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    // User stats
    const usersResult = await db.query(`
      SELECT
        subscription_tier,
        COUNT(*) as count,
        SUM(reports_used_this_month) as total_reports_used
      FROM users
      WHERE is_active = TRUE
      GROUP BY subscription_tier
    `);

    // Report stats
    const reportsResult = await db.query(`
      SELECT
        status,
        COUNT(*) as count,
        AVG(processing_time_ms) as avg_processing_time,
        AVG(games_analyzed) as avg_games_analyzed
      FROM scout_reports
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY status
    `);

    // Queue stats
    const queueStats = {
      waiting: await scoutQueue.getWaitingCount(),
      active: await scoutQueue.getActiveCount(),
      completed: await scoutQueue.getCompletedCount(),
      failed: await scoutQueue.getFailedCount(),
    };

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        reports: reportsResult.rows,
        queue: queueStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/users
 * Get all users
 */
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT
        id, email, full_name, subscription_tier, subscription_status,
        reports_used_this_month, reports_limit, created_at, last_login_at
       FROM users
       WHERE is_active = TRUE
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/jobs
 * Get job queue status
 */
router.get('/jobs', async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;

    let jobs;
    if (status === 'waiting') {
      jobs = await scoutQueue.getWaiting();
    } else if (status === 'active') {
      jobs = await scoutQueue.getActive();
    } else if (status === 'completed') {
      jobs = await scoutQueue.getCompleted();
    } else if (status === 'failed') {
      jobs = await scoutQueue.getFailed();
    }

    const jobData = jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }));

    res.json({
      success: true,
      data: { jobs: jobData },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/jobs/:jobId/retry
 * Retry a failed job
 */
router.post('/jobs/:jobId/retry', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await scoutQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    await job.retry();

    res.json({
      success: true,
      message: 'Job queued for retry',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
