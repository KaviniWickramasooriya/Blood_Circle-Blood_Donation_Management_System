const authMiddleware = require('./auth');

// Wrapper for requiring event organizer role
const requireEventOrganizer = authMiddleware('EventOrganiser');

// Wrapper for requiring admin role
const requireAdmin = authMiddleware('Admin');

// Wrapper for any authenticated user (no specific role)
const requireAuth = authMiddleware();

module.exports = {
  requireEventOrganizer,
  requireAdmin,
  requireAuth
};