const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const BloodRequest = sequelize.define('BloodRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }, blood_id: {   //  foreign key column
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'blood', 
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    /*bloodType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']] // Only valid blood types
      }
    },*/
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0 // Quantity cannot be negative
      }
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\d{10}$/ // Validates as a 10-digit phone number
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    request_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'declined'),
      allowNull: false,
      defaultValue: 'pending'
    }
    },{
        tableName: 'blood_request', // Explicit table name (avoids Sequelize auto-pluralizing)
        timestamps: true,            // Adds createdAt & updatedAt fields automatically
        underscored: true             // Uses snake_case column names in DB
    });
    BloodRequest.associate = (models) => {
        BloodRequest.belongsTo(models.Blood, { // many requests → one blood type
            foreignKey: 'blood_id',
            as: 'blood',
            onDelete: 'CASCADE'
        });
    };
    return BloodRequest;



}
