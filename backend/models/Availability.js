const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: (props) => `${props.value} is not a valid date (YYYY-MM-DD)`,
      },
    },
    times: {
      type: [String],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.every((v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)),
        message: (props) =>
          `One or more time values are invalid in array: ${props.value.join(', ')}`,
      },
    },
    location: {
      type: String,
      default: 'Online',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple availability entries for the same doctor on the same day
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
