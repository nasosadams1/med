const express = require('express');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['doctor', 'secretary']), async (req, res) => {
  const { start, end } = req.body;

  // Check if availability collides with existing appointments
  const conflict = await Appointment.findOne({
    doctorId: req.user.id,
    slot: { $gte: new Date(start), $lt: new Date(end) }
  });
  if (conflict) return res.status(400).json({ message: 'Conflicts with booked appointment' });

  const availability = new Availability({
    doctorId: req.user.id,
    start,
    end
  });
  await availability.save();

  res.json({ message: 'Availability added' });
});

router.get('/', roleMiddleware(['doctor', 'secretary']), async (req, res) => {
  const availabilities = await Availability.find({ doctorId: req.user.id });
  res.json(availabilities);
});

// Optional: Add route to delete or update availability

module.exports = router;
