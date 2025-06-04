// backend/services/notification.js
const nodemailer = require('nodemailer');

let transporter;

/**
 * Initializes and returns a reusable nodemailer transporter instance.
 */
function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true if port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Sends an appointment confirmation email.
 *
 * @param {string} to - Recipient email address
 * @param {Object} details - Appointment details
 * @param {string} details.doctorName - Doctor's full name
 * @param {string} details.date - Appointment date (YYYY-MM-DD)
 * @param {string} details.time - Appointment time (HH:mm)
 * @param {string} [subject] - Optional custom subject line
 * @param {string} [html] - Optional custom HTML content
 * @param {string} [text] - Optional custom plain text content
 */
async function sendNotification(
  to,
  { doctorName, date, time },
  subject = 'Your Appointment is Confirmed',
  html = null,
  text = null
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"Clinic Appointments" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text:
      text ||
      `Dear patient,

Your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}.

Thank you for choosing our clinic.

Best regards,
Clinic Team`,
    html:
      html ||
      `<p>Dear patient,</p>
       <p>Your appointment with <strong>Dr. ${doctorName}</strong> is confirmed for <strong>${date}</strong> at <strong>${time}</strong>.</p>
       <p>Thank you for choosing our clinic.</p>
       <p>Best regards,<br/>Clinic Team</p>`,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.info(`[${new Date().toISOString()}] Confirmation email sent to ${to}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send email to ${to}:`, error);
  }
}

module.exports = sendNotification;
