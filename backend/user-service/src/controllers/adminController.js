const { Admin } = require('../config/db').models;

exports.createAdmin = async (req, res) => {
  try {
    // Input validation
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required'
        }
      });
    }

    // Additional email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Create admin
    const admin = await Admin.create({ name, email, password });

    // Remove password from response
    const adminResponse = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    return res.status(201).json({
      message: 'Admin created successfully',
      data: adminResponse
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

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email already exists',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle password hashing errors
    if (error.message === 'Error hashing password') {
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to process password'
      });
    }

    // Handle unexpected errors
    console.error('Error creating admin:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while creating the admin'
    });
  }
};