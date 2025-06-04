const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "10:00"
  reason: { type: String },
  status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
});

appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true }); // prevent double booking

module.exports = mongoose.model('Appointment', appointmentSchema);
