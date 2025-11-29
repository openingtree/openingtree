const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../../db/connection');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/user/reports
 * Get user's report history
 */
router.get('/reports', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT id, target_username, target_platform, target_color,
             status, created_at, completed_at, processing_time_ms,
             games_analyzed
      FROM scout_reports
      WHERE user_id = $1 AND deleted_at IS NULL
    `;

    const params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM scout_reports WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    res.json({
      success: true,
      data: {
        reports: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/usage
 * Get usage statistics
 */
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    // Get this month's activity
    const activityResult = await db.query(
      `SELECT
        action,
        COUNT(*) as count
       FROM usage_logs
       WHERE user_id = $1
       AND created_at >= date_trunc('month', CURRENT_DATE)
       GROUP BY action`,
      [userId]
    );

    // Get reports created this month
    const reportsResult = await db.query(
      `SELECT
        status,
        COUNT(*) as count
       FROM scout_reports
       WHERE user_id = $1
       AND created_at >= date_trunc('month', CURRENT_DATE)
       AND deleted_at IS NULL
       GROUP BY status`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        subscription: {
          tier: user.subscription_tier,
          status: user.subscription_status,
          reports_used: user.reports_used_this_month,
          reports_limit: user.reports_limit,
          reports_remaining: user.reports_limit - user.reports_used_this_month,
        },
        activity: activityResult.rows,
        reports_by_status: reportsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/user/reports/:reportId
 * Delete a report
 */
router.delete('/reports/:reportId', authenticate, async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await db.findById('scout_reports', reportId);

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    if (report.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Soft delete
    await db.softDelete('scout_reports', reportId);

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
