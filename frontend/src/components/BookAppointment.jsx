import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BookAppointment() {
  // ...same code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.name || !form.email || !form.date || !form.time) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
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

  // ...rest unchanged
}
