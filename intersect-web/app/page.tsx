'use client';

import React, { useState } from 'react';

type pages = 'about' | 'join' | 'plan' | 'calendar'

interface NavBarProps {
  active: pages;
  setActiveScreen: (screen: pages) => void;
}

const NavBar = ({ active, setActiveScreen }: NavBarProps) => (
  <nav className="bg-green-300 p-4 flex justify-center gap-8">
    <button
      onClick={() => setActiveScreen('about')}
      className={`px-4 py-2 ${active === 'about' ? 'font-bold' : ''}`}
    >
      About
    </button>
    <button
      onClick={() => setActiveScreen('join')}
      className={`px-4 py-2 ${active === 'join' ? 'font-bold' : ''}`}
    >
      Join Room
    </button>
    <button
      onClick={() => setActiveScreen('plan')}
      className={`px-4 py-2 ${active === 'plan' ? 'font-bold' : ''}`}
    >
      Plan Event
    </button>
  </nav>
);

interface PlanEventScreenProps {
  setActiveScreen: (screen: pages) => void;
  eventName: string;
  setEventName: (name: string) => void;
}

const PlanEventScreen = ({ setActiveScreen, eventName, setEventName }: PlanEventScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col">
    <NavBar active="plan" setActiveScreen={setActiveScreen} />
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
              type="text"
              className="w-32 bg-green-300 px-4 py-3 rounded-lg text-center"
            />
            <span className="text-2xl">—</span>
            <input
              type="text"
              className="w-32 bg-green-300 px-4 py-3 rounded-lg text-center"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setActiveScreen('calendar')}
            className="bg-green-300 px-12 py-3 rounded-lg font-medium hover:bg-green-400 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
    <div className="h-16 bg-green-300"></div>
  </div>
);

interface JoinRoomScreenProps {
  setActiveScreen: (screen: pages) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
}

const JoinRoomScreen = ({ setActiveScreen, roomCode, setRoomCode }: JoinRoomScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col">
    <NavBar active="join" setActiveScreen={setActiveScreen} />
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-light mb-12">Join Room</h1>
      <div className="w-full max-w-md space-y-8">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-full bg-green-300 text-black placeholder-green-800 px-6 py-4 rounded-lg text-center"
        />

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setActiveScreen('calendar')}
            className="bg-green-300 px-12 py-3 rounded-lg font-medium hover:bg-green-400 transition"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
    <div className="h-16 bg-green-300"></div>
  </div>
);

interface AboutScreenProps {
  setActiveScreen: (screen: pages) => void;
}

const AboutScreen = ({ setActiveScreen }: AboutScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col">
    <NavBar active="join" setActiveScreen={setActiveScreen} />
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-light mb-12">About</h1>
      <div className="w-full max-w-md space-y-8">
      </div>
    </div>
    <div className="h-16 bg-green-300"></div>
  </div>
);

const CalendarScreen = () => {
  const calendarDays = [
    { day: 'SUN', date: 4 },
    { day: 'MON', date: 5 },
    { day: 'TUE', date: 6 },
    { day: 'WED', date: 7 },
    { day: 'THU', date: 8 },
    { day: 'FRI', date: 9 },
    { day: 'SAT', date: 10 }
  ];

  const events = [
    { day: 4, start: 9, duration: 4, color: 'bg-blue-400' },
    { day: 4, start: 14, duration: 2.5, color: 'bg-orange-400' },
    { day: 5, start: 9, duration: 5, color: 'bg-blue-400' },
    { day: 6, start: 9, duration: 4, color: 'bg-orange-400' },
    { day: 6, start: 14, duration: 3, color: 'bg-blue-400' },
    { day: 6, start: 17, duration: 3, color: 'bg-orange-400' },
    { day: 7, start: 9, duration: 3, color: 'bg-orange-400' },
    { day: 7, start: 13, duration: 4, color: 'bg-blue-400' },
    { day: 8, start: 9, duration: 5, color: 'bg-blue-400' },
    { day: 9, start: 9, duration: 4, color: 'bg-blue-400' },
    { day: 9, start: 14, duration: 3, color: 'bg-orange-400' }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-green-300 px-4 py-2 rounded">CXJ390H</div>
        <h1 className="text-4xl font-light flex-1 text-center">calendar</h1>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          10
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-sm">Jan ⟨⟩</div>
          {calendarDays.map((day, i) => (
            <div key={i} className="text-center p-2 border-l">
              <div className="text-xs text-gray-500">{day.day}</div>
              <div className={`font-medium ${i === 6 ? 'text-blue-500' : ''}`}>
                {day.date}
              </div>
            </div>
          ))}
        </div>

        <div className="relative h-96">
          <div className="absolute inset-0 grid grid-cols-8">
            <div className="text-xs text-gray-500 p-2 space-y-8">
              <div>9 AM</div>
              <div>10 AM</div>
              <div>11 AM</div>
              <div>12 PM</div>
              <div>1 PM</div>
              <div>2 PM</div>
              <div>3 PM</div>
              <div>4 PM</div>
              <div>5 PM</div>
              <div>6 PM</div>
              <div>7 PM</div>
              <div>8 PM</div>
              <div>9 PM</div>
              <div>10 PM</div>
            </div>
            
            {calendarDays.map((_, i) => (
              <div key={i} className="border-l relative bg-green-50">
                {events
                  .filter(event => event.day === calendarDays[i].date)
                  .map((event, j) => (
                    <div
                      key={j}
                      className={`absolute left-1 right-1 ${event.color} rounded opacity-80`}
                      style={{
                        top: `${((event.start - 9) / 13) * 100}%`,
                        height: `${(event.duration / 13) * 100}%`
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventPlanningApp = () => {
  const [activeScreen, setActiveScreen] = useState<pages>('plan');
  const [eventName, setEventName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="bg-gray-900 min-h-screen">
      {activeScreen === 'plan' && (
        <PlanEventScreen
          setActiveScreen={setActiveScreen}
          eventName={eventName}
          setEventName={setEventName}
        />
      )}
      {activeScreen === 'join' && (
        <JoinRoomScreen
          setActiveScreen={setActiveScreen}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
        />
      )}
      {activeScreen === 'calendar' && <CalendarScreen />}
      {activeScreen === 'about' && <AboutScreen setActiveScreen={setActiveScreen}/>}
    </div>
  );
};

export default EventPlanningApp;