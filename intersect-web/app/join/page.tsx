'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '../../components/NavBar';

export default function JoinRoomPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simply redirect to the calendar page - it will fetch the room data
      router.push(`/calendar/${roomCode}`);
    } catch (err) {
      setError('Failed to join room. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-light mb-12">Join Room</h1>
        <div className="w-full max-w-md space-y-8">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-green-300 text-black placeholder-green-800 px-6 py-4 rounded-lg text-center uppercase"
          />

          {error && (
            <div className="text-red-600 text-center">{error}</div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={handleJoin}
              disabled={loading}
              className="bg-green-300 px-12 py-3 rounded-lg font-medium hover:bg-green-400 transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
      <div className="h-16 bg-green-300"></div>
    </div>
  );
}