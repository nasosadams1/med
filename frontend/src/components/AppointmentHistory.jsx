import React, { useEffect, useState } from 'react';
import { API_URL } from '../api';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/appointments`);
        if (!res.ok) throw new Error('Failed to fetch appointments');

        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  if (loading) return <div className="text-center">Loading appointments...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;

  if (appointments.length === 0)
    return <div className="text-center text-gray-600">No appointments found.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Appointment History</h2>
      <ul>
        {appointments.map(({ id, name, email, date, time }) => (
          <li
            key={id}
            className="border-b last:border-b-0 py-2 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
            <div className="text-right text-sm text-gray-700">
              <p>{date}</p>
              <p>{time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
