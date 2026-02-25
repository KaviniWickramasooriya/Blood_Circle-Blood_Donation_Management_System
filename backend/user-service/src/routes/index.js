const express = require('express');
const router = express.Router();
const { Admin, Role, Gender, Donor, EventOrganiser } = require('../config/db').models;

// Admin routes
router.post('/admin', async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Role routes
router.post('/role', async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Gender routes
router.post('/gender', async (req, res) => {
  try {
    const gender = await Gender.create(req.body);
    res.status(201).json(gender);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Donor routes
router.post('/donor', async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// EventOrganiser routes
router.post('/event-organiser', async (req, res) => {
  try {
    const organiser = await EventOrganiser.create(req.body);
    res.status(201).json(organiser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;