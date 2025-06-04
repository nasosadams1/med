const nodemailer = require('nodemailer');
const twilio = require('twilio');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.scheduleReminder = async (appointment) => {
  const patient = await User.findById(appointment.patientId);

  if (!patient) return;

  const reminderTime = new Date(appointment.slot.getTime() - 24 * 60 * 60 * 1000);

  const delay = reminderTime.getTime() - Date.now();
  if (delay < 0) return; // Appointment less than 24h from now

  setTimeout(() => sendReminder(appointment, patient), delay);
};

function sendReminder(appointment, patient) {
  if (patient.notificationPreferences.email) {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Reminder',
      text: `Reminder: You have an appointment on ${appointment.slot.toLocaleString()}.`
    });
  }

  if (patient.notificationPreferences.sms && patient.phone) {
    twilioClient.messages.create({
      to: patient.phone,
      from: process.env.TWILIO_PHONE,
      body: `Reminder: Appointment on ${appointment.slot.toLocaleString()}`
    });
  }
}
