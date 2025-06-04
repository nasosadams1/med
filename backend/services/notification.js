const Appointment = require('../models/Appointment');

const scheduledReminders = new Map();

function sendNotification(user, message) {
  console.log(`Notification to ${user.email || user.phone}: ${message}`);
}

async function scheduleReminder(appointment) {
  // Cancel existing reminder if any
  if (scheduledReminders.has(appointment._id.toString())) {
    clearTimeout(scheduledReminders.get(appointment._id.toString()));
  }

  // Calculate reminder time: 1 hour before appointment
  const appointmentDateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.time.split(':').map(Number);
  appointmentDateTime.setHours(hours);
  appointmentDateTime.setMinutes(minutes);
  appointmentDateTime.setSeconds(0);

  const now = new Date();
  const diff = appointmentDateTime.getTime() - now.getTime() - 60 * 60 * 1000;

  if (diff <= 0) return; // appointment soon or past, skip reminder

  const timeout = setTimeout(async () => {
    // Fetch patient and doctor
    const patient = await require('../models/User').findById(appointment.patient);
    const doctor = await require('../models/User').findById(appointment.doctor);
    if (patient.notificationsEnabled) {
      sendNotification(patient, `Reminder: Your appointment with Dr. ${doctor.name} at ${appointment.time} is in 1 hour.`);
    }
    if (doctor.notificationsEnabled) {
      sendNotification(doctor, `Reminder: Appointment with patient ${patient.name} at ${appointment.time} is in 1 hour.`);
    }
    scheduledReminders.delete(appointment._id.toString());
  }, diff);

  scheduledReminders.set(appointment._id.toString(), timeout);
}

function startScheduler() {
  // On server start, schedule reminders for all future appointments
  Appointment.find({ status: 'scheduled', date: { $gte: new Date() } })
    .then(appointments => appointments.forEach(scheduleReminder))
    .catch(console.error);
}

module.exports = { scheduleReminder, startScheduler };
