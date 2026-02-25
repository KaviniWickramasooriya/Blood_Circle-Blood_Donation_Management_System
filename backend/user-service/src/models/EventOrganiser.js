const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const EventOrganiser = sequelize.define('EventOrganiser', {
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
    nic: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'NIC number is required' },
        len: { args: [8, 255], msg: 'NIC number must be at least 8 characters long' }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
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
  },{
      hooks: {
        beforeCreate: async (eventOrganiser) => {
          try {
            const salt = await bcrypt.genSalt(10);
            eventOrganiser.password = await bcrypt.hash(eventOrganiser.password, salt);
          } catch (error) {
            throw new Error('Error hashing password');
          }
        },
        beforeUpdate: async (eventOrganiser) => {
          if (eventOrganiser.changed('password')) {
            try {
              const salt = await bcrypt.genSalt(10);
              eventOrganiser.password = await bcrypt.hash(eventOrganiser.password, salt);
            } catch (error) {
              throw new Error('Error hashing password');
            }
          }
        }
      }
    });
  return EventOrganiser;
};