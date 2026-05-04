const jwt = require('jsonwebtoken');
const config = require('../../config');
const db = require('../../db/connection');
const logger = require('../../utils/logger');
const { AppError } = require('./errorHandler');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for API key
    if (!token && req.headers['x-api-key']) {
      const apiKey = req.headers['x-api-key'];
      const user = await db.findOne('users', { api_key: apiKey, is_active: true });

      if (!user) {
        throw new AppError('Invalid API key', 401);
      }

      req.user = user;
      req.authMethod = 'api_key';
      return next();
    }

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await db.findById('users', decoded.userId);

    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    // Attach user to request
    req.user = user;
    req.authMethod = 'jwt';
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

// Check subscription tier
const requireSubscription = (requiredTier) => {
  const tierHierarchy = { free: 0, pro: 1, team: 2 };

  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userTier = req.user.subscription_tier || 'free';
    const userLevel = tierHierarchy[userTier] || 0;
    const requiredLevel = tierHierarchy[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return next(new AppError(`${requiredTier} subscription required`, 403));
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await db.findById('users', decoded.userId);
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail - auth is optional
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireSubscription,
  optionalAuth,
};
