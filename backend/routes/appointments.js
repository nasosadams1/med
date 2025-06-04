const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const NotificationService = require('../services/notification');
const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['patient']), async (req, res) => {
  const { doctorId, slot, reason } = req.body;
  const slotDate = new Date(slot);

  // Check availability
  const available = await Availability.findOne({
    doctorId,
    start: { $lte: slotDate },
    end: { $gt: slotDate }
  });
  if (!available) return res.status(400).json({ message: 'Doctor not available at that time' });

  const conflict = await Appointment.findOne({ doctorId, slot: slotDate });
  if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

  const appointment = new Appointment({
    patientId: req.user.id,
    doctorId,
    slot: slotDate,
    reason
  });
  await appointment.save();

  NotificationService.scheduleReminder(appointment);

  res.json({ message: 'Appointment booked', appointment });
});

router.put('/:id', roleMiddleware(['patient']), async (req, res) => {
  const { id } = req.params;
  const { newSlot } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment || appointment.patientId.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const newDate = new Date(newSlot);

  const available = await Availability.findOne({
    doctorId: appointment.doctorId,
    start: { $lte: newDate },
    end: { $gt: newDate }
  });
  if (!available) return res.status(400).json({ message: 'Doctor not available at new time' });

  const conflict = await Appointment.findOne({ doctorId: appointment.doctorId, slot: newDate });
  if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

  appointment.slot = newDate;
  await appointment.save();

  res.json({ message: 'Appointment updated' });
});

router.get('/', async (req, res) => {
  const { role, id } = req.user;
  const { from, to, status } = req.query;
  const filter = {};

  if (role === 'patient') filter.patientId = id;
  if (role === 'doctor') filter.doctorId = id;

  if (from || to) {
    filter.slot = {};
    if (from) filter.slot.$gte = new Date(from);
    if (to) filter.slot.$lte = new Date(to);
  }

  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate('doctorId', 'name')
    .populate('patientId', 'name');
  res.json(appointments);
});

module.exports = router;
