import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export default function AppointmentHistory({ token }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      const res = await api.get('/appointments', { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(res.data);
    }
    fetchAppointments();
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Appointment History</h2>
      <ul>
        {appointments.map(app => (
          <li key={app._id} className="mb-2 border p-2 rounded">
            <div><strong>Doctor:</strong> {app.doctorId.name}</div>
            <div><strong>Patient:</strong> {app.patientId.name}</div>
            <div><strong>Time:</strong> {new Date(app.slot).toLocaleString()}</div>
            <div><strong>Status:</strong> {app.status}</div>
            <div><strong>Reason:</strong> {app.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
