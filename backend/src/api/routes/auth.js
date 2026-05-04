const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const db = require('../../db/connection');
const config = require('../../config');
const logger = require('../../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().min(2).max(255).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Helper function to generate JWT tokens
function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password, full_name } = value;

    // Check if user already exists
    const existingUser = await db.findOne('users', { email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.insert('users', {
      email,
      password_hash,
      full_name,
      subscription_tier: 'free',
      reports_limit: config.rateLimits.free,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await db.insert('refresh_tokens', {
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      user_agent: req.get('user-agent'),
      ip_address: req.ip,
    });

    logger.info('User registered', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          subscription_tier: user.subscription_tier,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Find user
    const user = await db.findOne('users', { email });
    if (!user || !user.is_active) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await db.insert('refresh_tokens', {
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      user_agent: req.get('user-agent'),
      ip_address: req.ip,
    });

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    logger.info('User logged in', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          subscription_tier: user.subscription_tier,
          reports_remaining: user.reports_limit - user.reports_used_this_month,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 400);
    }

    // Check if token exists and is not revoked
    const tokenRecord = await db.findOne('refresh_tokens', {
      token: refreshToken,
      revoked: false,
    });

    if (!tokenRecord) {
      throw new AppError('Invalid or revoked refresh token', 401);
    }

    // Check expiration
    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    // Generate new access token
    const { accessToken } = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (revoke refresh token)
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await db.query(
        'UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW() WHERE token = $1 AND user_id = $2',
        [refreshToken, req.user.id]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
        reports_used_this_month: user.reports_used_this_month,
        reports_limit: user.reports_limit,
        reports_remaining: user.reports_limit - user.reports_used_this_month,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/generate-api-key
 * Generate API key for programmatic access
 */
router.post('/generate-api-key', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Generate API key
    const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;

    // Update user with API key
    await db.query(
      'UPDATE users SET api_key = $1, api_key_created_at = NOW() WHERE id = $2',
      [apiKey, userId]
    );

    logger.info('API key generated', { userId });

    res.json({
      success: true,
      data: {
        api_key: apiKey,
        created_at: new Date().toISOString(),
        warning: 'Store this key securely. It will not be shown again.',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
