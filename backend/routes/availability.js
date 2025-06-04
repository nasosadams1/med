// routes/availability.js
const express = require('express');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Doctor adds availability - UC7
router.post('/', auth, role(['doctor']), async (req, res) => {
  const { date, startTime, endTime, type } = req.body;

  try {
    const availability = new Availability({
      doctor: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      type,
    });

    await availability.save();
    res.json({ message: 'Availability added', availability });
  } catch (err) {
    // Handle duplicate key (unique index) error gracefully
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Availability slot already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Doctor views own availability
router.get('/', auth, role(['doctor']), async (req, res) => {
  try {
    const availabilities = await Availability.find({ doctor: req.user._id }).sort({ date: 1, startTime: 1 });
    res.json(availabilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
