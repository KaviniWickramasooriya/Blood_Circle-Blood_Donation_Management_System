const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Blood = sequelize.define('Blood', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']]
      }
      
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },
    
   }, {
      tableName: 'blood',      // Explicit table name (avoids Sequelize auto-pluralizing)
      timestamps: true,        // Adds createdAt & updatedAt fields automatically
      underscored: true           // Uses snake_case column names in DB
    
  });

  Blood.associate = (models) => {
    Blood.hasMany(models.BloodRequest, {  // one blood type → many requests
      foreignKey: 'blood_id',
      as: 'requests',
       onDelete: 'CASCADE'
      

    });
  };
  return Blood;
};