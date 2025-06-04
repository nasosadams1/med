import React, { useState } from 'react';

export default function BookAppointment() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Simple validation
    if (!form.name || !form.email || !form.date || !form.time) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to book appointment.');
      }

      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setForm({ name: '', email: '', date: '', time: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>

      {message && (
        <div
          className={`p-2 rounded ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <input
        type="time"
        name="time"
        value={form.time}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
