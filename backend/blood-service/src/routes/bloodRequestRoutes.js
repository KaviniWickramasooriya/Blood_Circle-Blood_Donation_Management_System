const express = require('express');
const router = express.Router();

const bloodRequestController = require('../controllers/bloodRequestController');

// CRUD routes


router.post('/', bloodRequestController.createBloodRequest);
router.get('/', bloodRequestController.getAllBloodRequests); 
router.get('/:id', bloodRequestController.getBloodRequestById);
router.put('/:id', bloodRequestController.updateBloodRequest);
router.delete('/:id', bloodRequestController.deleteBloodRequest);
router.put('/:id/status', bloodRequestController.updateBloodRequestStatus);

module.exports = router;
