import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import path from 'node:path';
import dotenv from "dotenv";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;

export type Room = {
  code: string;
  users: User[];
  name: string;
  start: Date;
  end: Date;
}

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  calendarId: string;
}

export type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
}

export type CalendarData = {
  [email: string]: CalendarEvent[];
}

let rooms: Room[] = [];

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// OAuth2 client setup
const getOAuth2Client = (): OAuth2Client => {
  const credentials = require(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

// Fetch calendar events for a user
const fetchCalendarEvents = async (
  accessToken: string,
  calendarId: string,
  start: Date,
  end: Date
): Promise<CalendarEvent[]> => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    console.log(events);
    
    return events.map(event => ({
      id: event.id || '',
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
};

// Fetch calendar data for all users in a room
const fetchRoomCalendarData = async (room: Room, accessTokens: Record<string, string>): Promise<CalendarData> => {
  const calendarData: CalendarData = {};

  for (const user of room.users) {
    const accessToken = accessTokens[user.email];
    if (!accessToken) {
      console.warn(`No access token found for user ${user.email}`);
      continue;
    }

    try {
      const events = await fetchCalendarEvents(accessToken, user.calendarId, room.start, room.end);
      calendarData[user.email] = events;
    } catch (error) {
      console.error(`Error fetching calendar for ${user.email}:`, error);
      calendarData[user.email] = [];
    }
  }

  return calendarData;
};

// Store access tokens (in production, use a proper database)
const accessTokenStore: Record<string, Record<string, string>> = {};

// Generate a random 6-character room code
const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  if (rooms.some(r => r.code === code)) {
    return generateRoomCode();
  }
  return code;
};

export const createRoom = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  const startStr = first(req.query.start);
  const endStr = first(req.query.end);

  if (!name || !startStr || !endStr) {
    res.status(400).send({ error: 'Missing required parameters: name, start, end' });
    return;
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).send({ error: 'Invalid date format' });
    return;
  }

  if (start >= end) {
    res.status(400).send({ error: 'Start time must be before end time' });
    return;
  }

  const code = generateRoomCode();
  const room: Room = {
    code,
    users: [],
    name,
    start,
    end
  };

  rooms.push(room);
  accessTokenStore[code] = {};

  const calendarData = null;

  res.send({ room, calendarData });
};

export const joinRoom = async (req: SafeRequest, res: SafeResponse): Promise<void> => {
  const code = first(req.query.code);

  if (!code) {
    res.status(400).send({ error: 'Missing room code' });
    return;
  }

  const room = rooms.find((r) => r.code === code);

  if (!room) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }

  try {
    const calendarData = await fetchRoomCalendarData(room, accessTokenStore[code] || {});
    res.send({ room, calendarData });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).send({ error: 'Failed to fetch calendar data' });
  }
};

export const addCalendar = async (req: SafeRequest, res: SafeResponse): Promise<void> => {
  const code = first(req.query.code);
  const firstName = first(req.query.firstName);
  const lastName = first(req.query.lastName);
  const email = first(req.query.email);
  const calendarId = first(req.query.calendarId);
  const accessToken = first(req.query.accessToken);

  if (!code || !firstName || !lastName || !email || !calendarId || !accessToken) {
    res.status(400).send({ 
      error: 'Missing required parameters: code, firstName, lastName, email, calendarId, accessToken' 
    });
    return;
  }

  const room = rooms.find((r) => r.code === code);

  if (!room) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }

  // Check if user already exists in the room
  const existingUser = room.users.find(u => u.email === email);
  if (existingUser) {
    res.status(400).send({ error: 'User already added to this room' });
    return;
  }

  const user: User = {
    firstName,
    lastName,
    email,
    calendarId
  };

  // Store the access token
  if (!accessTokenStore[code]) {
    accessTokenStore[code] = {};
  }
  accessTokenStore[code][email] = accessToken;

  // Add user to room
  room.users.push(user);

  try {
    // Fetch calendar data for all users including the new one
    const calendarData = await fetchRoomCalendarData(room, accessTokenStore[code]);
    res.send({ room, calendarData });
  } catch (error) {
    console.error('Error adding calendar:', error);
    res.status(500).send({ error: 'Failed to add calendar' });
  }
};

export const refreshRoom = async (req: SafeRequest, res: SafeResponse): Promise<void> => {
  const code = first(req.query.code);

  if (!code) {
    res.status(400).send({ error: 'Missing room code' });
    return;
  }

  const room = rooms.find((r) => r.code === code);

  if (!room) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }

  try {
    const calendarData = await fetchRoomCalendarData(room, accessTokenStore[code] || {});
    res.send({ room, calendarData });
  } catch (error) {
    console.error('Error refreshing room:', error);
    res.status(500).send({ error: 'Failed to refresh room data' });
  }
};

export const debug = async (req: SafeRequest, res: SafeResponse): Promise<void> => {
  res.send({rooms, accessTokenStore})
}

// Helper function to make sure we are always getting a string not an array from the client
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};