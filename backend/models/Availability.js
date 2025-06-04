const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

availabilitySchema.index({ doctorId: 1, start: 1, end: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
