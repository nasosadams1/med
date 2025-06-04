import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export default function BookAppointment({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchDoctors() {
      // Here assuming doctors are users with role 'doctor'
      const res = await api.get('/auth/doctors', { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(res.data);
    }
    fetchDoctors();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', { doctorId, slot, reason }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Appointment booked successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error booking appointment');
    }
  };

  return (
    <form onSubmit={submit} className="mb-6 p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Book Appointment</h2>
      {message && <div className="mb-2">{message}</div>}
      <select value={doctorId} onChange={e => setDoctorId(e.target.value)} required className="mb-2 p-2 border w-full">
        <option value="">Select Doctor</option>
        {doctors.map(doc => (
          <option key={doc._id} value={doc._id}>{doc.name}</option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={slot}
        onChange={e => setSlot(e.target.value)}
        required
        className="mb-2 p-2 border w-full"
      />
      <input
        type="text"
        placeholder="Reason"
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="mb-2 p-2 border w-full"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Book</button>
    </form>
  );
}
