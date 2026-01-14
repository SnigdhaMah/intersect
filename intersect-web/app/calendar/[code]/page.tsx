'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, CalendarData, API_BASE_URL } from '../../../types';

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch room data on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/join-room?code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
          throw new Error('Room not found');
        }

        const data = await response.json();
        setRoom(data.room);
        setCalendarData(data.calendarData);
      } catch (err) {
        setError('Room not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchRoom();
    }
  }, [code]);

  const handleGoogleAuth = async () => {
    try {
      // Get auth URL from backend
      const response = await fetch(`${API_BASE_URL}/auth-url`);
      const data = await response.json();
      
      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        data.authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Show code input UI
      setShowCodeInput(true);
    } catch (err) {
      alert('Failed to initiate Google authentication');
      console.error(err);
    }
  };

  const handleSubmitCode = async () => {
    if (!authCode.trim()) {
      alert('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      
      // Exchange code for tokens
      const tokenResponse = await fetch(
        `${API_BASE_URL}/exchange-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: authCode.trim() })
        }
      );
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code');
      }
      
      const userData = await tokenResponse.json();
      
      // Add calendar to room
      const addResponse = await fetch(
        `${API_BASE_URL}/add-calendar?code=${encodeURIComponent(room!.code)}&firstName=${encodeURIComponent(userData.givenName || '')}&lastName=${encodeURIComponent(userData.familyName || '')}&email=${encodeURIComponent(userData.email)}&calendarId=primary&accessToken=${encodeURIComponent(userData.accessToken)}`,
        { method: 'POST' }
      );
      
      if (!addResponse.ok) {
        throw new Error('Failed to add calendar');
      }
      
      const roomData = await addResponse.json();
      setRoom(roomData.room);
      setCalendarData(roomData.calendarData);
      setShowCodeInput(false);
      setAuthCode('');
    } catch (err) {
      alert('Failed to add calendar. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-300 px-6 py-3 rounded-lg"
          >
            Go back to create or join a room
          </button>
        </div>
      </div>
    );
  }

  // Generate calendar days based on room dates
  const startDate = new Date(room.start);
  const endDate = new Date(room.end);
  const calendarDays = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate && calendarDays.length < 7) {
    calendarDays.push({
      day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: currentDate.getDate(),
      fullDate: new Date(currentDate)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Convert calendar data to events
  const events: Array<{ day: number; start: number; duration: number; color: string; user: string }> = [];
  const colors = ['bg-blue-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-400'];
  
  if (calendarData) {
    Object.entries(calendarData).forEach(([userEmail, userEvents], userIndex) => {
      const color = colors[userIndex % colors.length];
      
      userEvents.forEach(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const eventDate = eventStart.getDate();
        
        const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
        const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
        const duration = endHour - startHour;
        
        events.push({
          day: eventDate,
          start: startHour,
          duration,
          color,
          user: userEmail
        });
      });
    });
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-green-300 px-4 py-2 rounded font-mono">{room.code}</div>
        <h1 className="text-4xl font-light flex-1 text-center">{room.name}</h1>
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : '+ Add Calendar'}
        </button>
      </div>

      {showCodeInput && (
        <div className="mb-6 p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Enter Authorization Code</h2>
          <p className="text-sm text-gray-600 mb-4">
            After authorizing in the popup window, Google will show you an authorization code. 
            Copy that code and paste it below:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste authorization code here"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
              disabled={loading}
            />
            <button
              onClick={handleSubmitCode}
              disabled={loading || !authCode.trim()}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Submit'}
            </button>
            <button
              onClick={() => {
                setShowCodeInput(false);
                setAuthCode('');
              }}
              disabled={loading}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600">Participants: {room.users.length}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {room.users.map((user, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
              <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
              <span className="text-sm">{user.firstName} {user.lastName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-sm">
            {startDate.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          {calendarDays.map((day, i) => (
            <div key={i} className="text-center p-2 border-l">
              <div className="text-xs text-gray-500">{day.day}</div>
              <div className="font-medium">{day.date}</div>
            </div>
          ))}
        </div>

        <div className="relative h-96">
          <div className="absolute inset-0 grid grid-cols-8">
            <div className="text-xs text-gray-500 p-2 space-y-8">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i}>
                  {i + 9 > 12 ? `${i - 3} PM` : `${i + 9} AM`}
                </div>
              ))}
            </div>
            
            {calendarDays.map((day, i) => (
              <div key={i} className="border-l relative bg-green-50">
                {events
                  .filter(event => event.day === day.date)
                  .map((event, j) => (
                    <div
                      key={j}
                      className={`absolute left-1 right-1 ${event.color} rounded opacity-80 text-xs text-white p-1 overflow-hidden`}
                      style={{
                        top: `${((event.start - 9) / 13) * 100}%`,
                        height: `${(event.duration / 13) * 100}%`
                      }}
                      title={event.user}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}