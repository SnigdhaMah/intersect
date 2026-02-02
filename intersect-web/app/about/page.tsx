'use client';

import React from 'react';
import { NavBar } from '../../components/NavBar';
import '../styles.css';

export default function AboutPage() {
  return (
    <div className="page">
      <NavBar />

      <div className="content">
        <h1 className="title mb-large">About Intersect</h1>

        <div className="text-container">
          <p className="text-lg">
            Welcome to Intersect! This app helps you coordinate events by
            combining multiple Google calendars. 
          </p>

          <p className="text-muted">
            Create a room, share the code with friends, and plan your events with ease!
          </p>
        </div>
      </div>

      <div className="footer" />
    </div>
  );
}
