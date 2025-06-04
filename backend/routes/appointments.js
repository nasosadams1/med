const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const sendNotification = require('../services/notification');
const Doctor = require('../models/User'); // Assuming doctors are users with role 'doctor'

// @route   POST /api/appointments
// @desc    Book an appointment
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { doctorId, date, time } = req.body;
  const userId = req.user.id;

  if (!doctorId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Validate doctor
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor || doctor.role !== 'doctor') {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check availability
    const availability = await Availability.findOne({
      doctorId,
      date,
      times: time,
    }).session(session);

    if (!availability) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Selected time is not available.' });
    }

    // Prevent double-booking
    const conflict = await Appointment.findOne({
      doctorId,
      date,
      time,
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'This time slot is already booked.' });
    }

    // Book the appointment
    const newAppointment = new Appointment({
      patientId: userId,
      doctorId,
      date,
      time,
    });

    await newAppointment.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Notify patient via email
    const patient = await User.findById(userId);
    await sendNotification(patient.email, {
      doctorName: doctor.name,
      date,
      time,
    });

    return res.status(201).json({ success: true, message: 'Appointment booked successfully.' });
  } catch (error) {
    console.error('Appointment booking error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments for logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialization email')
      .sort({ date: 1, time: 1 });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Fetching appointments failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch appointments.' });
  }
});

module.exports = router;
