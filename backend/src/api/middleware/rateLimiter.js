const rateLimit = require('express-rate-limit');
const db = require('../../db/connection');
const logger = require('../../utils/logger');
const config = require('../../config');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for expensive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests, please slow down',
});

// Custom rate limiter based on subscription tier
const rateLimiter = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userId = req.user.id;
    const user = await db.findById('users', userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check monthly limit
    const limit = user.reports_limit || config.rateLimits.free;
    const used = user.reports_used_this_month || 0;

    if (used >= limit) {
      logger.warn('Rate limit exceeded', { userId, used, limit });
      return res.status(429).json({
        success: false,
        error: 'Monthly report limit exceeded',
        details: {
          limit,
          used,
          remaining: 0,
          reset_at: getNextMonthReset(),
        },
      });
    }

    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': (limit - used).toString(),
      'X-RateLimit-Reset': getNextMonthReset(),
    });

    next();
  } catch (error) {
    logger.error('Rate limiter error', { error });
    next(error);
  }
};

// Helper function to get next month reset timestamp
function getNextMonthReset() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

module.exports = {
  apiLimiter,
  strictLimiter,
  rateLimiter,
};
