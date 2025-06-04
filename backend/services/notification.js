// services/notification.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const scheduledReminders = new Map();

/**
 * Simulate sending notification (console log).
 * Replace this with actual email/SMS/etc logic later.
 */
function sendNotification(user, message) {
  if (!user) return;
  console.log(`Notification to ${user.email || user.phone || 'Unknown User'}: ${message}`);
}

/**
 * Schedule a reminder 1 hour before the appointment.
 * Cancels existing reminder if rescheduled.
 */
async function scheduleReminder(appointment) {
  const id = appointment._id.toString();

  // Cancel previous timeout if exists
  if (scheduledReminders.has(id)) {
    clearTimeout(scheduledReminders.get(id));
  }

  // Compose the appointment datetime (date + time)
  const appointmentDateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.time.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diff = appointmentDateTime.getTime() - now.getTime() - 60 * 60 * 1000; // 1 hour before

  if (diff <= 0) {
    // Appointment is less than an hour away or in the past - skip scheduling reminder
    return;
  }

  // Schedule notification to fire 1 hour before
  const timeout = setTimeout(async () => {
    try {
      const patient = await User.findById(appointment.patient);
      const doctor = await User.findById(appointment.doctor);

      if (patient?.notificationsEnabled) {
        sendNotification(patient, `Reminder: Your appointment with Dr. ${doctor?.name || ''} at ${appointment.time} is in 1 hour.`);
      }
      if (doctor?.notificationsEnabled) {
        sendNotification(doctor, `Reminder: Appointment with patient ${patient?.name || ''} at ${appointment.time} is in 1 hour.`);
      }
    } catch (err) {
      console.error('Failed to send appointment reminder:', err);
    }
    scheduledReminders.delete(id);
  }, diff);

  scheduledReminders.set(id, timeout);
}

/**
 * On server start, schedule reminders for all upcoming appointments.
 */
function startScheduler() {
  Appointment.find({ status: 'scheduled', date: { $gte: new Date() } })
    .then(appointments => {
      appointments.forEach(scheduleReminder);
    })
    .catch(err => {
      console.error('Failed to schedule appointment reminders:', err);
    });
}

module.exports = { scheduleReminder, startScheduler };
