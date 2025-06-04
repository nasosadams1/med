const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const notificationService = require('../services/notification');

const router = express.Router();

// Create appointment - UC1
router.post('/', auth, role(['patient']), async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  // Validations
  try {
    const selectedDate = new Date(date);
    if (selectedDate < new Date()) return res.status(400).json({ message: 'Date must be in the future' });

    // Check doctor availability for that date/time
    const availability = await Availability.findOne({
      doctor: doctorId,
      date: selectedDate,
      startTime: { $lte: time },
      endTime: { $gt: time }
    });
    if (!availability) return res.status(400).json({ message: 'Doctor not available at selected time' });

    // Check for existing appointment conflicts for patient and doctor
    const conflict = await Appointment.findOne({
      $or: [
        { doctor: doctorId, date: selectedDate, time, status: 'scheduled' },
        { patient: req.user._id, date: selectedDate, time, status: 'scheduled' }
      ]
    });
    if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: selectedDate,
      time,
      reason
    });
    await appointment.save();

    // Trigger notification scheduling
    notificationService.scheduleReminder(appointment);

    res.json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Modify appointment - UC2
router.put('/:id', auth, role(['patient']), async (req, res) => {
  const appointmentId = req.params.id;
  const { date, time, reason } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.patient.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    const selectedDate = new Date(date);
    if (selectedDate < new Date()) return res.status(400).json({ message: 'Date must be in the future' });

    // Check doctor availability for that date/time
    const availability = await Availability.findOne({
      doctor: appointment.doctor,
      date: selectedDate,
      startTime: { $lte: time },
      endTime: { $gt: time }
    });
    if (!availability) return res.status(400).json({ message: 'Doctor not available at selected time' });

    // Check for conflicts excluding this appointment
    const conflict = await Appointment.findOne({
      _id: { $ne: appointmentId },
      $or: [
        { doctor: appointment.doctor, date: selectedDate, time, status: 'scheduled' },
        { patient: req.user._id, date: selectedDate, time, status: 'scheduled' }
      ]
    });
    if (conflict) return res.status(400).json({ message: 'Time slot already booked' });

    appointment.date = selectedDate;
    appointment.time = time;
    appointment.reason = reason;
    await appointment.save();

    notificationService.scheduleReminder(appointment);

    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel appointment - UC3
router.delete('/:id', auth, role(['patient']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.patient.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get upcoming appointments for patient
router.get('/upcoming', auth, role(['patient']), async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: now },
      status: 'scheduled'
    }).populate('doctor', 'name email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointment history for patient (past + canceled)
router.get('/history', auth, role(['patient']), async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      patient: req.user._id,
      date: { $lt: now },
      status: { $in: ['completed', 'cancelled'] }
    }).populate('doctor', 'name email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
