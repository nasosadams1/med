require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Appointment model
const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true, unique: true }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Routes

// Get all reserved appointment dates
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().select('date -_id');
    res.json(appointments.map(a => a.date));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a new appointment
app.post('/api/appointments', async (req, res) => {
  const { name, phone, date } = req.body;
  if (!name || !phone || !date) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if date is already booked
    const existing = await Appointment.findOne({ date: new Date(date) });
    if (existing) {
      return res.status(400).json({ message: 'This date is already booked' });
    }

    // Save new appointment
    const appointment = new Appointment({ name, phone, date: new Date(date) });
    await appointment.save();

    res.json({ message: 'Appointment successfully reserved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
