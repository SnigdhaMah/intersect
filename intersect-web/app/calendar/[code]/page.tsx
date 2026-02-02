"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Room, CalendarData, API_BASE_URL } from "../../../types";
import "../../styles.css"

interface CalendarListItem {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

interface UserData {
  accessToken: string;
  refreshToken?: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
}

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showCalendarSelect, setShowCalendarSelect] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [userCalendars, setUserCalendars] = useState<CalendarListItem[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] =
    useState<string>("primary");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Fetch room data on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/join-room?code=${encodeURIComponent(code)}`,
        );

        if (!response.ok) {
          throw new Error("Room not found");
        }

        const data = await response.json();
        setRoom(data.room);
        setCalendarData(data.calendarData);
      } catch (err) {
        setError("Room not found");
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
        "Google OAuth",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Show code input UI
      setShowCodeInput(true);
    } catch (err) {
      alert("Failed to initiate Google authentication");
      console.error(err);
    }
  };

  const handleSubmitCode = async () => {
    if (!authCode.trim()) {
      alert("Please enter the authorization code");
      return;
    }

    try {
      setLoading(true);

      // Exchange code for tokens
      const tokenResponse = await fetch(`${API_BASE_URL}/exchange-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode.trim() }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange authorization code");
      }

      const user = await tokenResponse.json();
      setUserData(user);

      // Fetch user's calendars
      const calendarsResponse = await fetch(
        `${API_BASE_URL}/list-calendars?accessToken=${encodeURIComponent(user.accessToken)}`,
      );

      if (!calendarsResponse.ok) {
        throw new Error("Failed to fetch calendars");
      }

      const calendars = await calendarsResponse.json();
      setUserCalendars(calendars.calendars);

      // Set default to primary calendar
      const primaryCalendar = calendars.calendars.find(
        (cal: CalendarListItem) => cal.primary,
      );
      setSelectedCalendarId(primaryCalendar?.id || "primary");

      // Hide code input and show calendar selection
      setShowCodeInput(false);
      setAuthCode("");
      setShowCalendarSelect(true);
    } catch (err) {
      alert("Failed to add calendar. Please check the code and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCalendar = async () => {
    if (!userData || !selectedCalendarId) {
      alert("Please select a calendar");
      return;
    }

    try {
      setLoading(true);

      // Add calendar to room
      const addResponse = await fetch(
        `${API_BASE_URL}/add-calendar?code=${encodeURIComponent(room!.code)}&firstName=${encodeURIComponent(userData.givenName || "")}&lastName=${encodeURIComponent(userData.familyName || "")}&email=${encodeURIComponent(userData.email)}&calendarId=${encodeURIComponent(selectedCalendarId)}&accessToken=${encodeURIComponent(userData.accessToken)}`,
        { method: "POST" },
      );

      if (!addResponse.ok) {
        throw new Error("Failed to add calendar");
      }

      const roomData = await addResponse.json();
      setRoom(roomData.room);
      setCalendarData(roomData.calendarData);
      setShowCalendarSelect(false);
      setUserData(null);
      setUserCalendars([]);
    } catch (err) {
      alert("Failed to add calendar. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !room) {
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
          <p className="text-red-600 mb-4">{error || "Room not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-green-300 px-6 py-3 rounded-lg"
          >
            Go back to create or join a room
          </button>
        </div>
      </div>
    );
  }

  // Generate all weeks from start to end date
  const startDate = new Date(room.start);
  const endDate = new Date(room.end);

  // Normalize to midnight for safe date-only comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Find the start of the first week (Sunday before or on start date)
  const firstWeekStart = new Date(startDate);
  firstWeekStart.setDate(startDate.getDate() - startDate.getDay());

  // Generate all weeks
  const weeks: Array<
    Array<{
      day: string;
      date: number;
      month: number;
      year: number;
      fullDate: Date;
    }>
  > = [];
  const currentWeekStart = new Date(firstWeekStart);

  while (currentWeekStart <= endDate) {
    const week = [];
    const weekStart = new Date(currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);

      week.push({
        day: dayDate
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        date: dayDate.getDate(),
        month: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        fullDate: new Date(dayDate),
      });
    }

    weeks.push(week);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  // Get current week
  const calendarDays = weeks[currentWeekIndex] || weeks[0];

  // Convert calendar data to events
  const events: Array<{
    day: number;
    month: number;
    year: number;
    start: number;
    duration: number;
    color: string;
    user: string;
  }> = [];
  const colors = [
    "bg-blue-400",
    "bg-orange-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-yellow-400",
  ];

  // In the calendar rendering section, update how events are matched:
  if (calendarData) {
    Object.entries(calendarData).forEach(
      ([userCalendarKey, userEvents], userIndex) => {
        const color = colors[userIndex % colors.length];

        userEvents.forEach((event) => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);

          const startHour =
            eventStart.getHours() + eventStart.getMinutes() / 60;
          const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
          const duration = endHour - startHour;

          events.push({
            day: eventStart.getDate(),
            month: eventStart.getMonth(),
            year: eventStart.getFullYear(),
            start: startHour,
            duration,
            color,
            user: userCalendarKey, // Now shows email:calendarId
          });
        });
      },
    );
  }

  // Generate hours from 12 AM to 11 PM (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12 AM";
    if (i < 12) return `${i} AM`;
    if (i === 12) return "12 PM";
    return `${i - 12} PM`;
  });

  // Format week range for display
  const weekStart = calendarDays[0].fullDate;
  const weekEnd = calendarDays[6].fullDate;
  const weekRangeText = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="calendar-container">
      {/* Fixed header */}
      <div className="calendar-code">{room.code}</div>
      <h1 className="calendar-title">{room.name}</h1>
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="add-calendar-button"
      >
        {loading ? "Adding..." : "+ Add Calendar"}
      </button>

      {/* Authorization code input */}
      {showCodeInput && (
        <div className="mb-6 p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">
            Enter Authorization Code
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            After authorizing in the popup window, Google will show you an
            authorization code. Copy that code and paste it below:
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
              {loading ? "Loading..." : "Submit"}
            </button>
            <button
              onClick={() => {
                setShowCodeInput(false);
                setAuthCode("");
              }}
              disabled={loading}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calendar selection */}
      {showCalendarSelect && (
        <div className="mb-6 p-6 border-2 border-green-500 rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold mb-4">
            Select Calendar to Share
          </h2>

          {/* Privacy notice */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-gray-700">
              <strong>Privacy Notice:</strong> You will be sharing your calendar
              availability (busy/free times) with this room for the duration:{" "}
              <strong>{startDate.toLocaleDateString()}</strong> to{" "}
              <strong>{endDate.toLocaleDateString()}</strong>. Event names and
              details will NOT be shared - only the times when you&apos;re busy.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose which calendar to share:
            </label>
            <select
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              disabled={loading}
            >
              {userCalendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.summary} {calendar.primary ? "(Primary)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmCalendar}
              disabled={loading}
              className="flex-1 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Adding Calendar..." : "Confirm & Share Calendar"}
            </button>
            <button
              onClick={() => {
                setShowCalendarSelect(false);
                setUserData(null);
                setUserCalendars([]);
              }}
              disabled={loading}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Participants */}
      {/* // In the Participants section, update to show calendar info: */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Participants & Calendars: {room.users.length}
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {room.users.map((user, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
            >
              <div
                className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}
              ></div>
              <span className="text-sm">
                {user.firstName} {user.lastName}
                {room.users.filter((u) => u.email === user.email).length >
                  1 && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Calendar{" "}
                    {
                      room.users.filter(
                        (u, idx) => u.email === user.email && idx <= i,
                      ).length
                    }
                    )
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar with scrolling */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week navigation and header row */}
        <div className="bg-white sticky top-0 z-20">
          {/* Week selector */}
          <div className="flex items-center justify-center gap-4 p-2 border-b bg-gray-50">
            <button
              onClick={() =>
                setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))
              }
              disabled={currentWeekIndex === 0}
              className="px-3 py-1 bg-green-300 rounded hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {weekRangeText}
            </span>
            <button
              onClick={() =>
                setCurrentWeekIndex(
                  Math.min(weeks.length - 1, currentWeekIndex + 1),
                )
              }
              disabled={currentWeekIndex === weeks.length - 1}
              className="px-3 py-1 bg-green-300 rounded hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-2 text-sm">Time</div>
            {calendarDays.map((day, i) => (
              <div key={i} className="text-center p-2 border-l">
                <div className="text-xs text-gray-500">{day.day}</div>
                <div className="font-medium">
                  {day.date}
                  {day.month !== calendarDays[3].month && (
                    <span className="text-xs text-gray-500 ml-1">
                      {day.fullDate.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable calendar body */}
        <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
          <div className="relative" style={{ height: `${24 * 60}px` }}>
            <div className="absolute inset-0 grid grid-cols-8">
              {/* Time labels column */}
              <div className="text-xs text-gray-500 border-r bg-white sticky left-0 z-10">
                {hours.map((hour, i) => (
                  <div
                    key={i}
                    className="px-2 border-b"
                    style={{
                      height: "60px",
                      lineHeight: "60px",
                    }}
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {/* Calendar days columns */}
              {calendarDays.map((day, i) => {
                const isInRoomRange =
                  day.fullDate >= startDate && day.fullDate <= endDate;

                return (
                  <div
                    key={i}
                    className={`border-l relative ${
                    isInRoomRange ? "bg-green-50" : "bg-white"
                  }`}

                  >
                  {/* Hour lines */}
                  {hours.map((_, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="border-b"
                      style={{ height: "60px" }}
                    />
                  ))}

                  {/* Events */}
                  {events
                    .filter(
                      (event) =>
                        event.day === day.date &&
                        event.month === day.month &&
                        event.year === day.year,
                    )
                    .map((event, j) => (
                      <div
                        key={j}
                        className={`absolute left-1 right-1 ${event.color} rounded opacity-80 text-xs text-white p-1 overflow-hidden`}
                        style={{
                          top: `${event.start * 60}px`,
                          height: `${event.duration * 60}px`,
                        }}
                        title={event.user}
                      />
                    ))}
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
