const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const notificationService = require('../services/notification');

const router = express.Router();

// ** Quick test route (no auth) for frontend dev/testing **
router.get('/', (req, res) => {
  res.json([
    { id: 1, patient: 'Test User', date: '2025-06-01', doctor: 'Dr. Bob' },
    { id: 2, patient: 'Test User', date: '2025-06-02', doctor: 'Dr. Jane' }
  ]);
});

// Create appointment - UC1
router.post('/', auth, role(['patient']), async (req, res) => {
  // ... your existing code ...
});

// Modify appointment - UC2
router.put('/:id', auth, role(['patient']), async (req, res) => {
  // ... your existing code ...
});

// Cancel appointment - UC3
router.delete('/:id', auth, role(['patient']), async (req, res) => {
  // ... your existing code ...
});

// Get upcoming appointments for patient
router.get('/upcoming', auth, role(['patient']), async (req, res) => {
  // ... your existing code ...
});

// Get appointment history for patient (past + canceled)
router.get('/history', auth, role(['patient']), async (req, res) => {
  // ... your existing code ...
});

module.exports = router;
