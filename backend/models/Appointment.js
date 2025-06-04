const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: Date, required: true },
  reason: String,
  notes: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
});

appointmentSchema.index({ doctorId: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
