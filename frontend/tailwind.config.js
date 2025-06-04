import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [formData, setFormData] = useState({ doctorId: '', date: '', time: '' });
  const [loading, setLoading] = useState({ doctors: false, availability: false, booking: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading((l) => ({ ...l, doctors: true }));
      setError('');
      try {
        const { data } = await axios.get('/api/availability/doctors');
        setDoctors(data);
      } catch {
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading((l) => ({ ...l, doctors: false }));
      }
    };
    fetchDoctors();
  }, []);

  // Fetch availability with debounce (to avoid too many requests if user changes inputs quickly)
  useEffect(() => {
    if (!formData.doctorId || !formData.date) {
      setAvailability([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoading((l) => ({ ...l, availability: true }));
      setError('');
      try {
        const { data } = await axios.get(`/api/availability/${formData.doctorId}/${formData.date}`);
        setAvailability(data.times || []);
      } catch {
        setError('Failed to load availability. Please try another date.');
        setAvailability([]);
      } finally {
        setLoading((l) => ({ ...l, availability: false }));
      }
    };

    fetchAvailability();
  }, [formData.doctorId, formData.date]);

  // Unified input change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  }, []);

  // Validate form inputs
  const validateForm = () => {
    if (!formData.doctorId) return 'Please select a doctor.';
    if (!formData.date) return 'Please select a date.';
    if (!formData.time) return 'Please select a time slot.';
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading((l) => ({ ...l, booking: true }));

    try {
      const { data } = await axios.post('/api/appointments', formData);
      if (data.success) {
        setSuccess(data.message || 'Appointment booked successfully!');
        setFormData((prev) => ({ ...prev, time: '' }));
        setAvailability([]);
      } else {
        setError(data.message || 'Failed to book appointment.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Network error. Please try again.'
      );
    } finally {
      setLoading((l) => ({ ...l, booking: false }));
    }
  };

  // Disable submit if loading
  const isSubmitting = loading.booking;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Book an Appointment</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Doctor Select */}
        <div>
          <label htmlFor="doctorId" className="block font-medium mb-1">Select Doctor</label>
          {loading.doctors ? (
            <p className="text-gray-500">Loading doctors...</p>
          ) : (
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading.doctors}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(({ _id, name, specialization }) => (
                <option key={_id} value={_id}>
                  Dr. {name} ({specialization})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="block font-medium mb-1">Select Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading.doctors}
          />
        </div>

        {/* Time Select */}
        <div>
          <label htmlFor="time" className="block font-medium mb-1">Select Time</label>
          {loading.availability ? (
            <p className="text-gray-500">Loading available times...</p>
          ) : availability.length === 0 && formData.date && formData.doctorId ? (
            <p className="italic text-gray-500">No available times for this date.</p>
          ) : (
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!availability.length || loading.availability}
            >
              <option value="">-- Choose a Time --</option>
              {availability.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot}>
                  {timeSlot}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading.doctors || loading.availability}
          className={`w-full py-2 px-4 rounded text-white font-semibold transition ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
