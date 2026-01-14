'use client';

import React from 'react';
import { NavBar } from '../../components/NavBar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-light mb-12">About</h1>
        <div className="w-full max-w-2xl space-y-4 text-center">
          <p className="text-lg">
            Welcome to Event Planning! This app helps you coordinate events by combining multiple people&apos;s calendars.
          </p>
          <p className="text-gray-600">
            Create a room, share the code with participants, and find the best time for everyone to meet.
          </p>
        </div>
      </div>
      <div className="h-16 bg-green-300"></div>
    </div>
  );
}