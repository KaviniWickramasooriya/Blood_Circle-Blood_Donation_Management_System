const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Gender = sequelize.define('Gender', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return Gender;
};