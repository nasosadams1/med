import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AppointmentHistory({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to fetch appointments. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  return (
    <div className="mt-8 bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Appointment History</h2>

      {loading && <p className="text-gray-600">Loading appointments...</p>}

      {error && (
        <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-gray-500">No past appointments found.</p>
      )}

      {!loading && appointments.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {appointments.map((apt) => (
            <li key={apt.id} className="py-3">
              <div className="text-sm font-medium text-gray-800">
                Dr. {apt.doctor}
              </div>
              <div className="text-sm text-gray-600">
                {apt.date} at {apt.time}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AppointmentHistory;
