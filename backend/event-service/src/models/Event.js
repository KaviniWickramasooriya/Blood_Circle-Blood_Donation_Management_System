const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event name is required' },
        len: { args: [2, 255], msg: 'Event name must be between 2 and 255 characters' }
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Valid date is required' }
      }
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: { args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, msg: 'Valid time format (HH:MM) is required' }
      }
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: { args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, msg: 'Valid end time format (HH:MM) is required' }
      }
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Location is required' },
        len: { args: [2, 500], msg: 'Location must be between 2 and 500 characters' }
      }
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'District is required' },
        len: { args: [2, 100], msg: 'District must be between 2 and 100 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Organizer ID is required' },
        isInt: { msg: 'Organizer ID must be an integer' }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        notEmpty: { msg: 'Status is required' }
      }
    },
    expectedParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Expected participants cannot be negative' },
        isInt: { msg: 'Expected participants must be an integer' }
      }
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100,
      validate: {
        min: { args: [1], msg: 'Max capacity must be at least 1' },
        isInt: { msg: 'Max capacity must be an integer' }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: { msg: 'Is active must be a boolean' }
      }
    },
    rejectionReason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['organizerId', 'name', 'date']
      },
      {
        fields: ['status']
      },
      {
        fields: ['date']
      },
      {
        fields: ['organizerId']
      },
      {
        fields: ['district']
      }
    ],
    hooks: {
      beforeCreate: async (event) => {
        // Auto-set status to pending if not provided
        if (!event.status) {
          event.status = 'pending';
        }
        // Ensure event start time is in future
        const now = new Date();
        const eventDateTime = new Date(`${event.date}T${event.time}:00`);
        if (eventDateTime <= now) {
          throw new Error('Event start time must be in the future');
        }
        // Ensure end time is after start time
        const eventEndTime = new Date(`${event.date}T${event.endTime}:00`);
        if (eventEndTime <= eventDateTime) {
          throw new Error('End time must be after start time');
        }
      },
      beforeUpdate: async (event) => {
        // Validation for updates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate <= today && event.isActive) {
          throw new Error('Cannot update active event with past date');
        }
        // Additional check for updated time
        if (event.date && event.time) {
          const now = new Date();
          const eventDateTime = new Date(`${event.date}T${event.time}:00`);
          if (eventDateTime <= now && event.isActive) {
            throw new Error('Cannot update event to a past start time');
          }
        }
        if (event.date && event.time && event.endTime) {
          const eventDateTime = new Date(`${event.date}T${event.time}:00`);
          const eventEndTime = new Date(`${event.date}T${event.endTime}:00`);
          if (eventEndTime <= eventDateTime) {
            throw new Error('End time must be after start time');
          }
        }
      }
    }
  });

  return Event;
};