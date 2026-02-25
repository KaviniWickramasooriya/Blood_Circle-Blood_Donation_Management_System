const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Admin model
module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: { msg: 'Invalid email format' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: { args: [8, 255], msg: 'Password must be at least 8 characters long' }
      }
    }
  }, {
    hooks: {
      // Hash password before creating admin
      beforeCreate: async (admin) => {
        try {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        } catch (error) {
          throw new Error('Error hashing password');
        }
      },
      // Hash password before updating (if password is being updated)
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          try {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          } catch (error) {
            throw new Error('Error hashing password');
          }
        }
      }
    }
  });

  return Admin;
};