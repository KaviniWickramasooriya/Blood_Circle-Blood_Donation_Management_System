
const express = require('express');
const router = express.Router();

const bloodController = require('../controllers/bloodController');

router.get('/', bloodController.getAllBloodRecords); 
router.get('/:id', bloodController.getBloodRecordById);
router.post('/', bloodController.createBlood);
router.put('/:id', bloodController.updateBloodRecord);
router.delete('/:id', bloodController.deleteBloodRecord);
router.put('/:id/add-quantity', bloodController.addBloodQuantity);




module.exports = router;
