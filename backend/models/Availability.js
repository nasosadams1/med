const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  type: { type: String, enum: ['in-person', 'telemedicine'], default: 'in-person' },
});

availabilitySchema.index({ doctor: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
