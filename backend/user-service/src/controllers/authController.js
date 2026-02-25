const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Donor, EventOrganiser } = require('../config/db').models;

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d'; 

// Validate TOKEN_EXPIRY format
const validExpiryFormats = ['s', 'm', 'h', 'd'];
const validateTokenExpiry = (expiry) => {
  if (typeof expiry === 'number' && expiry > 0) return true;
  if (typeof expiry !== 'string') return false;
  const regex = /^\d+[smhd]$/;
  return regex.test(expiry);
};

// Generalized login function
const loginUser = async (Model, userType, req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Find user by email
    const user = await Model.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }

    // Validate TOKEN_EXPIRY before generating token
    if (!validateTokenExpiry(TOKEN_EXPIRY)) {
      console.error('Invalid TOKEN_EXPIRY format:', TOKEN_EXPIRY);
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Invalid token expiry configuration'
      });
    }

    // Prepare user data for JWT (excluding password)
    const userData = { ...user.get({ plain: true }), userType };
    delete userData.password;

    // Generate JWT token
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      message: `${userType} logged in successfully`,
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({
        error: 'Token generation failed',
        details: 'Error creating authentication token'
      });
    }

    // Handle unexpected errors
    console.error(`Error during ${userType} login:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during login'
    });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  return loginUser(Admin, 'Admin', req, res);
};

// Donor login
exports.donorLogin = async (req, res) => {
  return loginUser(Donor, 'Donor', req, res);
};

// Event Organisor login
exports.organisorLogin = async (req, res) => {
  return loginUser(EventOrganiser, 'EventOrganiser', req, res);
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        details: 'Please log in again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Authentication token is invalid'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Error verifying authentication token'
    });
  }
};

// Middleware to check user type
exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user || !userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};