'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../app/styles.css';

export const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link
        href="/about"
        className={`nav-link ${pathname === '/about' ? 'active' : ''}`}
      >
        About
      </Link>

      <Link
        href="/join"
        className={`nav-link ${pathname === '/join' ? 'active' : ''}`}
      >
        Join Room
      </Link>

      <Link
        href="/"
        className={`nav-link ${pathname === '/' ? 'active' : ''}`}
      >
        Plan Event
      </Link>
    </nav>
  );
};
