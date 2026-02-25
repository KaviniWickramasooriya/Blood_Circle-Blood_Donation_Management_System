const Joi = require('joi');

const validateEventCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.base': 'Event name must be a string',
      'string.min': 'Event name must be at least 2 characters long',
      'string.max': 'Event name cannot exceed 255 characters',
      'any.required': 'Event name is required'
    }),
    date: Joi.date().iso().min('now').required().messages({
      'date.base': 'Event date must be a valid date',
      'date.min': 'Event date must be today or in the future',
      'any.required': 'Event date is required'
    }),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Event time must be in HH:MM format',
      'any.required': 'Event time is required'
    }),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Event end time must be in HH:MM format',
      'any.required': 'Event end time is required'
    }),
    location: Joi.string().min(2).max(500).required().messages({
      'string.base': 'Location must be a string',
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 500 characters',
      'any.required': 'Location is required'
    }),
    district: Joi.string().min(2).max(100).required().messages({
      'string.base': 'District must be a string',
      'string.min': 'District must be at least 2 characters long',
      'string.max': 'District cannot exceed 100 characters',
      'any.required': 'District is required'
    }),
    description: Joi.string().max(1000).allow('', null).messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    expectedParticipants: Joi.number().integer().min(0).allow(null).messages({
      'number.base': 'Expected participants must be a valid number',
      'number.integer': 'Expected participants must be an integer',
      'number.min': 'Expected participants cannot be negative'
    }),
    maxCapacity: Joi.number().integer().min(1).allow(null).messages({
      'number.base': 'Max capacity must be a valid number',
      'number.integer': 'Max capacity must be an integer',
      'number.min': 'Max capacity must be at least 1'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details[0].message
    });
  }

  next();
};

const validateEventUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).optional().messages({
      'string.base': 'Event name must be a string',
      'string.min': 'Event name must be at least 2 characters long',
      'string.max': 'Event name cannot exceed 255 characters'
    }),
    date: Joi.date().iso().optional().messages({
      'date.base': 'Event date must be a valid date'
    }),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null).optional().messages({
      'string.pattern.base': 'Event time must be in HH:MM format'
    }),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null).optional().messages({
      'string.pattern.base': 'Event end time must be in HH:MM format'
    }),
    location: Joi.string().min(2).max(500).optional().messages({
      'string.base': 'Location must be a string',
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 500 characters'
    }),
    district: Joi.string().min(2).max(100).optional().messages({
      'string.base': 'District must be a string',
      'string.min': 'District must be at least 2 characters long',
      'string.max': 'District cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000).allow('', null).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    expectedParticipants: Joi.number().integer().min(0).allow(null).optional().messages({
      'number.base': 'Expected participants must be a valid number',
      'number.integer': 'Expected participants must be an integer',
      'number.min': 'Expected participants cannot be negative'
    }),
    maxCapacity: Joi.number().integer().min(1).allow(null).optional().messages({
      'number.base': 'Max capacity must be a valid number',
      'number.integer': 'Max capacity must be an integer',
      'number.min': 'Max capacity must be at least 1'
    }),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional().messages({
      'any.only': 'Invalid status value'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details[0].message
    });
  }

  next();
};

const validateEventApproval = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'any.only': 'Status must be "approved" or "rejected"',
      'any.required': 'Status is required'
    }),
    rejectionReason: Joi.string().max(500).allow('', null).when('status', {
      is: 'rejected',
      then: Joi.string().min(1).required().messages({
        'string.min': 'Rejection reason is required when rejecting',
        'any.required': 'Rejection reason is required'
      }),
      otherwise: Joi.optional()
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateEventCreation,
  validateEventUpdate,
  validateEventApproval
};