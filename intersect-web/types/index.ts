export type pages = 'about' | 'join' | 'plan' | 'calendar'

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  calendarId: string;
}

export interface Room {
  code: string;
  users: User[];
  name: string;
  start: string;
  end: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  attendees?: string[];
}

export interface CalendarData {
  [email: string]: CalendarEvent[];
}

export interface UserAuth {
  accessToken: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const API_BASE_URL = 'http://localhost:3333';