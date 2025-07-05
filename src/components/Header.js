// src/components/Header.js
'use client'; // This component needs to be a client component to use useSession

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut

export default function Header() {
  const { data: session, status } = useSession(); // Get session data and loading status

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo/Brand Name */}
      <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
        Real Estate App
      </Link>

      {/* Navigation Links */}
      <nav className="flex space-x-4 items-center">
        <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
          Properties
        </Link>
        {/* Conditionally render "Create Property" link only if authenticated */}
        {status === 'authenticated' && (
          <Link href="/properties/create" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
            Create Property
          </Link>
        )}

        {/* User Authentication Status */}
        {status === 'loading' ? (
          <p className="text-gray-500">Loading...</p>
        ) : session ? (
          // If session exists (user is logged in)
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">
              Welcome, {session.user?.name || session.user?.email}!
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })} // Sign out and redirect to home
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          // If no session (user is not logged in)
          <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}