'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavBar = () => {
  const pathname = usePathname();
  
  return (
    <nav className="bg-green-300 p-4 flex justify-center gap-8">
      <Link
        href="/about"
        className={`px-4 py-2 ${pathname === '/about' ? 'font-bold' : ''}`}
      >
        About
      </Link>
      <Link
        href="/join"
        className={`px-4 py-2 ${pathname === '/join' ? 'font-bold' : ''}`}
      >
        Join Room
      </Link>
      <Link
        href="/"
        className={`px-4 py-2 ${pathname === '/' ? 'font-bold' : ''}`}
      >
        Plan Event
      </Link>
    </nav>
  );
};