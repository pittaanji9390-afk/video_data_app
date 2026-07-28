/**
 * JWT Authentication Middleware
 * Protects private API endpoints by verifying the JWT Access Token in Authorization header
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to authenticate requests using JWT Access Tokens
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 1. Check for missing Authorization header
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authentication token provided.',
    });
  }

  // 2. Validate Bearer scheme format
  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid token format. Expected "Bearer <token>".',
    });
  }

  const token = parts[1];

  // 3. Verify JWT Access Token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // 4. Attach authenticated user information to request object
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token has expired. Please refresh your token.',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = {
  authenticateJWT,
};
