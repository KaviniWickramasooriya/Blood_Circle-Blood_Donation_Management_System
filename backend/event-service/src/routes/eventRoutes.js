const express = require('express');
const router = express.Router();
const { requireEventOrganizer, requireAdmin, requireAuth } = require('../middleware/roleAuth');
const {
  validateEventCreation,
  validateEventUpdate,
  validateEventApproval
} = require('../middleware/validation');
const {
  createEvent,
  getAllEvents,
  getPublicEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent
} = require('../controllers/eventController');

// Public route (no auth) - shows approved events for everyone
router.get('/public', getPublicEvents);

// Authenticated routes
router.use(requireAuth);

router.post('/', requireEventOrganizer, validateEventCreation, createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', requireEventOrganizer, validateEventUpdate, updateEvent);
router.delete('/:id', requireEventOrganizer, deleteEvent);

// Admin route for approvals
router.patch('/:id/approve', requireAdmin, validateEventApproval, approveEvent);

module.exports = router;