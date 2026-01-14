'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '../components/NavBar';
import { API_BASE_URL } from '../types';

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
      
      // Redirect to calendar page with room code
      router.push(`/calendar/${data.room.code}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-light mb-12">Plan a New Event</h1>
        <div className="w-full max-w-md space-y-8">
          <input
            type="text"
            placeholder="New Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full bg-green-300 text-black placeholder-green-800 px-6 py-4 rounded-lg text-center"
          />
          
          <div className="space-y-4">
            <p className="text-center text-lg">Possible Time Frame</p>
            <div className="flex items-center justify-center gap-4">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-48 bg-green-300 px-4 py-3 rounded-lg text-center"
              />
              <span className="text-2xl">—</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-48 bg-green-300 px-4 py-3 rounded-lg text-center"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center">{error}</div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-green-300 px-12 py-3 rounded-lg font-medium hover:bg-green-400 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
      <div className="h-16 bg-green-300"></div>
    </div>
  );
}