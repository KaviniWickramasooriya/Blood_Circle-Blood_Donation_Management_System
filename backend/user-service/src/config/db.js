const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    define: {
      // freezeTableName: true, // Prevents table name pluralization
      timestamps: true,     // Ensures createdAt and updatedAt
      underscored: false,   // Prevents automatic underscore conversion
      raw: false, // Ensures Sequelize uses the model's exact case for column names
    },
    logging: console.log,
  }
);

// Import models
const Admin = require('../models/Admin')(sequelize);
const Role = require('../models/Role.js')(sequelize);
const Gender = require('../models/Gender.js')(sequelize);
const Donor = require('../models/Donor')(sequelize);
const EventOrganiser = require('../models/EventOrganiser')(sequelize);

// Define associations
// Admin.belongsTo(Role);
// Admin.belongsTo(Gender);
// Donor.belongsTo(Gender);
// EventOrganiser.belongsTo(Role);

module.exports = sequelize;