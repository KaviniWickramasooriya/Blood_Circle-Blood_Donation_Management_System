const { Donor, Role } = require('../config/db').models;
const bcrypt = require('bcrypt');
const axios = require('axios');

exports.registerDonor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bloodType,
      dateOfBirth,
      nic,
      address,
      genderId,
      telephoneNo
    } = req.body;

    // Input validation (removed roleId from required fields)
    if (!name || !email || !password || !bloodType || !dateOfBirth || !nic || !address || !genderId || !telephoneNo) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required',
          bloodType: bloodType ? undefined : 'Blood type is required',
          dateOfBirth: dateOfBirth ? undefined : 'Date of birth is required',
          nic: nic ? undefined : 'NIC is required',
          address: address ? undefined : 'Address is required',
          genderId: genderId ? undefined : 'Gender ID is required',
          telephoneNo: telephoneNo ? undefined : 'Telephone number is required'
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

    // Validate dateOfBirth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({
        error: 'Invalid date of birth or future date'
      });
    }

    // Validate telephone number (basic check for digits and length)
    const telephoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!telephoneRegex.test(telephoneNo)) {
      return res.status(400).json({
        error: 'Invalid telephone number format (10-15 digits with optional + or spaces/dashes)'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Fetch the roleId for "Donor" from the Roles table
    const donorRole = await Role.findOne({ where: { name: 'Donor' } });
    if (!donorRole) {
      return res.status(400).json({
        error: 'Role "Donor" not found',
        details: 'Please ensure the "Donor" role exists in the Roles table'
      });
    }
    const roleId = donorRole.id;

    // Create donor with the automatically assigned roleId
    const donor = await Donor.create({
      name,
      email,
      password: hashedPassword,
      bloodType,
      dateOfBirth,
      nic,
      address,
      genderId,
      roleId,
      telephoneNo
    });

    // Remove password from response
    const donorResponse = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      bloodType: donor.bloodType,
      dateOfBirth: donor.dateOfBirth,
      nic: donor.nic,
      address: donor.address,
      genderId: donor.genderId,
      roleId: donor.roleId, // Include the automatically assigned roleId
      telephoneNo: donor.telephoneNo,
      createdAt: donor.createdAt,
      updatedAt: donor.updatedAt
    };

    return res.status(201).json({
      message: 'Donor registered successfully',
      data: donorResponse
    });

  } catch (error) {
    // Handle Sequelize validation errors
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

    // Handle unique constraint errors (e.g., email or nic already exists)
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: 'Duplicate entry',
        details: errors
      });
    }

    // Handle foreign key constraint errors (e.g., invalid genderId or roleId)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const field = Object.keys(error.fields)[0];
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: {
          field: field === 'genderId' ? 'genderId' : 'roleId',
          message: `The ${field === 'genderId' ? 'gender' : 'role'} does not exist`
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
    console.error('Error registering donor:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while registering the donor'
    });
  }
};

exports.getDonorCount = async (req, res) => {
  try {
    const donorCount = await Donor.count();
    res.status(200).json({ count: donorCount });
  } catch (error) {
    console.error('Error fetching donor count:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while fetching the donor count',
    });
  }
};

exports.getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.findAll({
      attributes: { exclude: ['password'] }
    });

    const gatewayService = process.env.GATEWAY_SERVICE || 'http://localhost:3000';

    const donorsWithData = await Promise.all(
      donors.map(async (donor) => {
        let genderName = 'Unknown';
        try {
          const response = await axios.get(`${gatewayService}/api/users/gender/genderById/${donor.genderId}`);
          if (response.data && response.data.data) {
            genderName = response.data.data.name;
          }
        } catch (error) {
          console.error(`Failed to fetch gender for donor ${donor.id}:`, error.message);
        }

        let bloodTypeName = 'Unknown';
        try {
          const response = await axios.get(`${gatewayService}/api/blood/v1/${donor.bloodType}`);
          if (response.data) {
            bloodTypeName = response.data.type;
          }
        } catch (error) {
          console.error(`Failed to fetch blood type for donor ${donor.id}:`, error.message);
        }
        return {
          id: donor.id,
          name: donor.name,
          email: donor.email,
          bloodType: donor.bloodType,
          bloodTypeName: bloodTypeName,
          dateOfBirth: donor.dateOfBirth,
          nic: donor.nic,
          address: donor.address,
          genderId: donor.genderId,
          gender: genderName,
          roleId: donor.roleId,
          telephoneNo: donor.telephoneNo,
          createdAt: donor.createdAt,
          updatedAt: donor.updatedAt
        };
      })
    );
    return res.status(200).json({
      message: 'Donors retrieved successfully',
      data: donorsWithData
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while fetching donors'
    });
  }
};

exports.getDonorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid donor ID',
        details: 'Donor ID must be a valid number'
      });
    }

    //Find Donor
    const donor = await Donor.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!donor) {
      return res.status(404).json({
        error: 'Donor not found',
        details: `No donor found with ID ${id}`
      });
    }

    return res.status(200).json({
      message: 'Donor retrieved successfully',
      data: donor
    });
  } catch (error) {
    console.error('Error fetching donor:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while fetching the donor'
    });
  }
};

exports.getDonorProfile = async (req, res) => {
  try {
    const donorId = req.user.id;

    if (!donorId || isNaN(donorId)) {
      return res.status(400).json({
        error: 'Invalid donor ID',
        details: 'Donor ID must be a valid number'
      });
    }

    const donor = await Donor.findByPk(donorId, {
      attributes: { exclude: ['password'] }
    });

    if (!donor) {
      return res.status(404).json({
        error: 'Donor not found',
        details: `No donor found with ID ${donorId}`
      });
    }

    const gatewayService = process.env.GATEWAY_SERVICE || 'http://localhost:3000';

    let genderName = 'Unknown';
    try {
      const response = await axios.get(`${gatewayService}/api/users/gender/genderById/${donor.genderId}`);
      if (response.data && response.data.data) {
        genderName = response.data.data.name;
      }
    } catch (error) {
      console.error(`Failed to fetch gender for donor ${donorId}:`, error.message);
    }

    let bloodTypeName = 'Unknown';
    try {
      const response = await axios.get(`${gatewayService}/api/blood/${donor.bloodType}`);
      if (response.data) {
        bloodTypeName = response.data.type;
      }
    } catch (error) {
      console.error(`Failed to fetch blood type for donor ${donorId}:`, error.message);
    }

    const donorResponse = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      bloodType: donor.bloodType,
      bloodTypeName: bloodTypeName,
      dateOfBirth: donor.dateOfBirth,
      nic: donor.nic,
      address: donor.address,
      genderId: donor.genderId,
      gender: genderName,
      roleId: donor.roleId,
      telephoneNo: donor.telephoneNo,
      createdAt: donor.createdAt,
      updatedAt: donor.updatedAt
    };

    return res.status(200).json({
      message: 'Donor profile retrieved successfully',
      data: donorResponse
    });
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while fetching the donor profile'
    });
  }
};

exports.updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      bloodType,
      dateOfBirth,
      nic,
      address,
      genderId,
      telephoneNo
    } = req.body;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid donor ID',
        details: 'Donor ID must be a valid number'
      });
    }

    const donor = await Donor.findByPk(id);
    if (!donor) {
      return res.status(404).json({
        error: 'Donor not found',
        details: `No donor found with ID ${id}`
      });
    }

    // Validate provided fields
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        return res.status(400).json({
          error: 'Invalid date of birth or future date'
        });
      }
    }

    if (telephoneNo && !/^\+?[\d\s-]{10,15}$/.test(telephoneNo)) {
      return res.status(400).json({
        error: 'Invalid telephone number format (10-15 digits with optional + or spaces/dashes)'
      });
    }

    // Update only provided fields
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (bloodType) updatedFields.bloodType = bloodType;
    if (dateOfBirth) updatedFields.dateOfBirth = dateOfBirth;
    if (nic) updatedFields.nic = nic;
    if (address) updatedFields.address = address;
    if (genderId) updatedFields.genderId = genderId;
    if (telephoneNo) updatedFields.telephoneNo = telephoneNo;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updatedFields.password = hashedPassword;
    }

    await donor.update(updatedFields);

    // Remove password from response
    const donorResponse = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      bloodType: donor.bloodType,
      dateOfBirth: donor.dateOfBirth,
      nic: donor.nic,
      address: donor.address,
      genderId: donor.genderId,
      roleId: donor.roleId,
      telephoneNo: donor.telephoneNo,
      createdAt: donor.createdAt,
      updatedAt: donor.updatedAt
    };

    return res.status(200).json({
      message: 'Donor updated successfully',
      data: donorResponse
    });
  } catch (error) {
    // Handle Sequelize validation errors
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

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: 'Duplicate entry',
        details: errors
      });
    }

    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const field = Object.keys(error.fields)[0];
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: {
          field: field === 'genderId' ? 'genderId' : 'roleId',
          message: `The ${field === 'genderId' ? 'gender' : 'role'} does not exist`
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

    console.error('Error updating donor:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while updating the donor'
    });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid donor ID',
        details: 'Donor ID must be a valid number'
      });
    }

    const donor = await Donor.findByPk(id);
    if (!donor) {
      return res.status(404).json({
        error: 'Donor not found',
        details: `No donor found with ID ${id}`
      });
    }

    await donor.destroy();

    return res.status(200).json({
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while deleting the donor'
    });
  }
};