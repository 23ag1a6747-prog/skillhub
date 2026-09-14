const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header and attaches req.user.
 * Protected routes must use this before any handler that needs an identity.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid session. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/** Restricts a route to admin users. Must run after requireAuth. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

/**
 * Attaches req.user if a valid token is present, but does not fail the
 * request when it's missing/invalid. Useful for public routes (e.g. public
 * portfolio pages) that behave slightly differently for the owner.
 */
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch (_err) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
