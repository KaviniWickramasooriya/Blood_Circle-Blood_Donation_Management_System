const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

// Import models
const Blood = require('../models/Blood')(sequelize);
const BloodRequest = require('../models/BloodRequest')(sequelize);
// Create models object
const models = { Blood, BloodRequest };


Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});
console.log('Loaded models:', Object.keys(sequelize.models));

module.exports = {
  sequelize,
  models: {
    Blood,
    BloodRequest,
  },};


 /*  const { Sequelize } = require('sequelize');
require('dotenv').config();

// 🧩 Use host.docker.internal by default when running inside Docker
const DB_HOST = process.env.DB_HOST || 'host.docker.internal';
const DB_PORT = process.env.DB_PORT || 3306;

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false, // optional: set to true for debugging SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Import models
const Blood = require('../models/Blood')(sequelize);
const BloodRequest = require('../models/BloodRequest')(sequelize);

// Associate models
const models = { Blood, BloodRequest };
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

console.log('Loaded models:', Object.keys(sequelize.models));

// Export for use in server.js
module.exports = {
  sequelize,
  models,
};
 */