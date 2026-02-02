'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '../../components/NavBar';
import '../styles.css';

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
      router.push(`/calendar/${roomCode}`);
    } catch (err) {
      setError('Failed to join room. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <NavBar />

      <div className="content">
        <h1 className="title">Join Room</h1>
        <h1 className="sub-heading mb-large">Enter Room Code</h1>

        <div className="form">
          <input
            type="text"
            placeholder="ABCDEF"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="text-input uppercase"
          />

          {error && <div className="error">{error}</div>}

          <div className="button-row">
            <button
              onClick={handleJoin}
              disabled={loading}
              className="button"
            >
              {loading ? 'Joining...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>

      <div className="footer" />
    </div>
  );
}
