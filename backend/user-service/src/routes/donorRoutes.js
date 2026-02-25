const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const authMiddleware = require("../middleware/auth");

router.post('/register', donorController.registerDonor);
router.get('/count', authMiddleware('Admin'), donorController.getDonorCount);
router.get('/', authMiddleware('Admin'), donorController.getAllDonors);
router.get('/:id', authMiddleware('Admin'), donorController.getDonorById);
router.get('/profile', authMiddleware('Donor'), donorController.getDonorProfile);
router.put('/:id', authMiddleware('Admin'), donorController.updateDonor);
router.delete('/:id', authMiddleware('Admin'), donorController.deleteDonor);

module.exports = router;