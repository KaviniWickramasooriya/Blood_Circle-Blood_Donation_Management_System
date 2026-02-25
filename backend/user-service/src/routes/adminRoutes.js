const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// create admin route
router.post('/', adminController.createAdmin);

module.exports = router;
