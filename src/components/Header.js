// src/components/Header.js
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();

  const hasRole = (requiredRole) => {
    return session?.user?.role === requiredRole;
  };

  return (
    // Added 'sticky top-0 z-50' classes to make the header static
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo/Brand Name */}
      <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
        Real Estate App Demo
      </Link>

      {/* Navigation Links */}
      <nav className="flex space-x-4 items-center">
        <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
          Properties
        </Link>
        {status === 'authenticated' && (hasRole('AGENT') || hasRole('ADMIN')) && (
          <Link href="/properties/create" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
            Create Property
          </Link>
        )}
        {/* Admin Panel Link, visible only for ADMIN */}
        {status === 'authenticated' && hasRole('ADMIN') && (
          <Link href="/admin/users" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
            Admin Panel
          </Link>
        )}

        {/* User Authentication Status */}
        {status === 'loading' ? (
          <p className="text-gray-500">Loading...</p>
        ) : session ? (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">
              Welcome, {session.user?.name || session.user?.email} ({session.user?.role})!
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
