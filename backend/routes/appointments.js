const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const notificationService = require('../services/notification');

const router = express.Router();

// Quick test route (no auth)
router.get('/', (req, res) => {
  res.json([
    { id: 1, patient: 'Test User', date: '2025-06-01', doctor: 'Dr. Bob' },
    { id: 2, patient: 'Test User', date: '2025-06-02', doctor: 'Dr. Jane' }
  ]);
});

// Create appointment - UC1
router.post('/', auth, role(['patient']), async (req, res) => {
  const { doctor, date, time, reason } = req.body;
  try {
    // Check if doctor is available for that date/time
    const availability = await Availability.findOne({
      doctor,
      date: new Date(date),
      startTime: { $lte: time },
      endTime: { $gte: time }
    });
    if (!availability) {
      return res.status(400).json({ message: 'Doctor is not available at that time' });
    }

    // Check if appointment slot is already booked
    const existingAppointment = await Appointment.findOne({ doctor, date: new Date(date), time, status: 'scheduled' });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Appointment slot already booked' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor,
      date: new Date(date),
      time,
      reason
    });
    await appointment.save();

    // Schedule notification
    notificationService.scheduleReminder(appointment);

    res.status(201).json({ message: 'Appointment scheduled', appointment });
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
    if (!appointment.patient.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only modify your own appointments' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Only scheduled appointments can be modified' });
    }

    // Check availability again for new date/time if changed
    if (date || time) {
      const newDate = date ? new Date(date) : appointment.date;
      const newTime = time || appointment.time;

      const availability = await Availability.findOne({
        doctor: appointment.doctor,
        date: newDate,
        startTime: { $lte: newTime },
        endTime: { $gte: newTime }
      });

      if (!availability) {
        return res.status(400).json({ message: 'Doctor is not available at the new time' });
      }

      const existingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        date: newDate,
        time: newTime,
        status: 'scheduled',
        _id: { $ne: appointmentId }
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'Appointment slot already booked' });
      }

      appointment.date = newDate;
      appointment.time = newTime;
    }

    if (reason) appointment.reason = reason;

    await appointment.save();

    // Reschedule notification
    notificationService.scheduleReminder(appointment);

    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel appointment - UC3
router.delete('/:id', auth, role(['patient']), async (req, res) => {
  const appointmentId = req.params.id;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.patient.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Only scheduled appointments can be cancelled' });
    }

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
      status: 'scheduled',
      date: { $gte: now }
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
      $or: [
        { status: 'cancelled' },
        { date: { $lt: now } }
      ]
    }).populate('doctor', 'name email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
