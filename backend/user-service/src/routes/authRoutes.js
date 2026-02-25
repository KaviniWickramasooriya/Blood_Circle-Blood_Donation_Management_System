const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/admin/login', authController.adminLogin);
router.post('/donor/login', authController.donorLogin);
router.post('/organisor/login', authController.organisorLogin);

// Protected routes (examples)
// router.get(
//   '/admin/dashboard',
//   authController.verifyToken,
//   authController.restrictTo('Admin'),
//   (req, res) => {
//     res.status(200).json({
//       message: 'Welcome to Admin Dashboard',
//       user: req.user
//     });
//   }
// );

// router.get(
//   '/donor/profile',
//   authController.verifyToken,
//   authController.restrictTo('Donor'),
//   (req, res) => {
//     res.status(200).json({
//       message: 'Welcome to Donor Profile',
//       user: req.user
//     });
//   }
// );

module.exports = router;