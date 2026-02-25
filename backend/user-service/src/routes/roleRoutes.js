const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');

router.post('/role', authMiddleware('Admin'), roleController.createRole);
router.get('/roles', authMiddleware('Admin'), roleController.getAllRoles);
router.get('/role/:id', authMiddleware('Admin'), roleController.getRoleById);
router.put('/role/:id', authMiddleware('Admin'), roleController.updateRole);
router.delete('/role/:id', authMiddleware('Admin'), roleController.deleteRole);
router.get('/role/:id/name', roleController.getRoleNameById);

module.exports = router;