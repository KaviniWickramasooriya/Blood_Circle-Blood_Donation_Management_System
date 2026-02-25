const jwt = require('jsonwebtoken');
require('dotenv').config();

// Auth Middleware
const authMiddleware = (requiredUserType) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded token (including userType) to request object

      // Check if userType matches the required role
      if (requiredUserType && decoded.userType !== requiredUserType) {
        return res.status(403).json({
          error: 'Forbidden',
          details: `Access denied. Required user type: ${requiredUserType}`,
        });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Authentication error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      res.status(500).json({ error: 'Internal server error', details: 'Authentication failed' });
    }
  };
};

module.exports = authMiddleware;