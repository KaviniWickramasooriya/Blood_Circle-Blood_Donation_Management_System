const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Donor = sequelize.define('Donor', {
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
    },
    bloodType: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nic: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    genderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Genders',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    telephoneNo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: async (donor) => {
        try {
          const salt = await bcrypt.genSalt(10);
          donor.password = await bcrypt.hash(donor.password, salt);
        } catch (error) {
          throw new Error('Error hashing password');
        }
      },
      beforeUpdate: async (donor) => {
        if (donor.changed('password')) {
          try {
            const salt = await bcrypt.genSalt(10);
            donor.password = await bcrypt.hash(donor.password, salt);
          } catch (error) {
            throw new Error('Error hashing password');
          }
        }
      }
    }
  });
  return Donor;
};