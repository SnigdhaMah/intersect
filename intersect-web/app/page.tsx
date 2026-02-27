'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '../components/NavBar';
import { API_BASE_URL } from '../types';
import './styles.css';

export default function PlanEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!eventName || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/create-room?name=${encodeURIComponent(eventName)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json();
      router.push(`/calendar/${data.room.code}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <NavBar />

      <div className="content">
        <h1 className="title">Plan a New Event</h1>

        <div className="form">
          <input
            type="text"
            placeholder="New Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="text-input"
          />

          <div className="time-section">
            <p className="sub-heading">Possible Time Frame</p>

            <div className="time-row">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="datetime-input"
              />
              <span className="time-separator">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="datetime-input"
              />
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="button-row">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="button"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="footer" />
    </div>
  );
}
