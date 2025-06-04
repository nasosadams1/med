import React, { useEffect, useState } from 'react';

function AppointmentHistory({ api }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load appointments. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <section className="mt-8 bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Appointment History</h2>

      {loading && <p className="text-gray-600">Loading...</p>}

      {error && (
        <div
          role="alert"
          className="text-red-700 bg-red-100 p-2 mb-4 rounded border border-red-400"
        >
          {error}
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-gray-500">No appointments found.</p>
      )}

      {!loading && appointments.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {appointments.map((apt) => (
            <li key={apt.id} className="py-3">
              <div className="text-sm text-gray-800">
                <strong>Doctor:</strong> {apt.doctor}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Date:</strong> {apt.date}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Time:</strong> {apt.time}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AppointmentHistory;
