const { Op } = require('sequelize');  // Added missing import for Op.iLike
const { EventOrganiser, Role } = require('../config/db').models;

exports.createEventOrganiser = async (req, res) => {
  try {
    const { name, email, password, nic, address, telephoneNo } = req.body;

    // Input validation
    if (!name || !email || !password || !nic || !address || !telephoneNo) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required',
          nic: nic ? undefined : 'NIC is required',
          address: address ? undefined : 'Address is required',
          telephoneNo: telephoneNo ? undefined : 'Mobile is required',
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

    // Fetch the roleId for "Organisor" from the Roles table
    const organisorRole = await Role.findOne({ where: { name: 'Organisor' } });
    if (!organisorRole) {
      return res.status(400).json({
        error: 'Role "Organisor" not found',
        details: 'Please ensure the "Organisor" role exists in the Roles table'
      });
    }
    const roleId = organisorRole.id;

    // Create EventOrganiser with the automatically assigned roleId
    const eventOrganiser = await EventOrganiser.create({
      name,
      email,
      password,
      nic,
      address,
      telephoneNo,
      roleId,
    });

    // Prepare response (exclude password and include roleId)
    const eventOrganiserResponse = {
      id: eventOrganiser.id,
      name: eventOrganiser.name,
      email: eventOrganiser.email,
      nic: eventOrganiser.nic,
      address: eventOrganiser.address,
      telephoneNo: eventOrganiser.telephoneNo,
      roleId: eventOrganiser.roleId, // Include the automatically assigned roleId
    };

    return res.status(201).json({
      message: 'Event Organiser Created Successfully',
      data: eventOrganiserResponse
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
        error: 'Duplicate entry',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle foreign key constraint errors (e.g., invalid roleId)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: {
          field: 'roleId',
          message: 'The specified role does not exist'
        }
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
    console.error('Error creating Event Organiser:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while creating the Event Organiser'
    });
  }
};

exports.getOrganisorCount = async (req, res) => {
  try {
    const organisorCount = await EventOrganiser.count();
    res.status(200).json({ count: organisorCount });
  } catch (error) {
    console.error('Error fetching organisor count:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while fetching the organisor count',
    });
  }
};

exports.getEventOrganiserById = async (req, res) => {
  try {
    const { id } = req.params;

    const eventOrganiser = await EventOrganiser.findByPk(id, {
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    if (!eventOrganiser) {
      return res.status(404).json({
        error: 'Event Organiser not found',
        details: `No Event Organiser found with ID ${id}`
      });
    }

    return res.status(200).json({
      data: eventOrganiser
    });
  } catch (error) {
    console.error('Error fetching Event Organiser:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching the Event Organiser'
    });
  }
};

exports.getAllEventOrganisers = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, email, nic } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` }; // Case-insensitive search
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (nic) where.nic = { [Op.iLike]: `%${nic}%` };

    const { count, rows } = await EventOrganiser.findAndCountAll({
      where,
      attributes: { exclude: ['password'] }, // Exclude password from response
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']] // Sort by name ascending
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching Event Organisers:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching Event Organisers'
    });
  }
};

exports.updateEventOrganiser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, nic, address, telephoneNo, roleId } = req.body;

    // Input validation
    if (!name || !email || !nic || !address || !telephoneNo || !roleId) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          nic: nic ? undefined : 'NIC is required',
          address: address ? undefined : 'Address is required',
          telephoneNo: telephoneNo ? undefined : 'Mobile is required',
          roleId: roleId ? undefined : 'Role ID is required'
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

    // Check if roleId exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({
        error: 'Invalid role',
        details: `Role with ID ${roleId} does not exist`
      });
    }

    const eventOrganiser = await EventOrganiser.findByPk(id);
    if (!eventOrganiser) {
      return res.status(404).json({
        error: 'Event Organiser not found',
        details: `No Event Organiser found with ID ${id}`
      });
    }

    // Update fields
    const updateData = { name, email, nic, address, telephoneNo, roleId };
    if (password) {
      updateData.password = password; // Will be hashed by beforeUpdate hook
    }

    await eventOrganiser.update(updateData);

    // Prepare response (exclude password)
    const eventOrganiserResponse = {
      id: eventOrganiser.id,
      name: eventOrganiser.name,
      email: eventOrganiser.email,
      nic: eventOrganiser.nic,
      address: eventOrganiser.address,
      telephoneNo: eventOrganiser.telephoneNo,
      roleId: eventOrganiser.roleId
    };

    return res.status(200).json({
      message: 'Event Organiser Updated Successfully',
      data: eventOrganiserResponse
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
        error: 'Duplicate entry',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: {
          field: 'roleId',
          message: 'The specified role does not exist'
        }
      });
    }

    if (error.message === 'Error hashing password') {
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to process password'
      });
    }

    console.error('Error updating Event Organiser:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while updating the Event Organiser'
    });
  }
};

exports.deleteEventOrganiser = async (req, res) => {
  try {
    const { id } = req.params;

    const eventOrganiser = await EventOrganiser.findByPk(id);
    if (!eventOrganiser) {
      return res.status(404).json({
        error: 'Event Organiser not found',
        details: `No Event Organiser found with ID ${id}`
      });
    }

    await eventOrganiser.destroy();

    return res.status(200).json({
      message: 'Event Organiser Deleted Successfully'
    });
  } catch (error) {
    console.error('Error deleting Event Organiser:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while deleting the Event Organiser'
    });
  }
};