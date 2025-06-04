require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/med';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  Warning: JWT_SECRET not set in .env');
}

app.use(cors()); // Allow all origins by default - adjust for production
app.use(express.json());

let appointmentsCollection;

async function main() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db();
  appointmentsCollection = db.collection('appointments');

  // GET /api/appointments
  app.get('/api/appointments', async (req, res) => {
    try {
      const appointments = await appointmentsCollection.find().toArray();
      // Map _id to id for frontend consistency
      const formatted = appointments.map(({ _id, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      }));
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching appointments' });
    }
  });

  // POST /api/appointments
  app.post('/api/appointments', async (req, res) => {
    try {
      const { name, email, date, time } = req.body;

      // Basic validation
      if (!name || !email || !date || !time) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const newAppointment = { name, email, date, time };

      const result = await appointmentsCollection.insertOne(newAppointment);
      res.status(201).json({
        id: result.insertedId.toString(),
        ...newAppointment,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error creating appointment' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
