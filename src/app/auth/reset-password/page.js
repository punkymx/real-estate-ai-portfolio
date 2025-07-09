// src/app/auth/reset-password/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL query parameter

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success messages
  const [error, setError] = useState(null); // For error messages

  // Effect to handle initial token check and potential redirection if no token is present
  useEffect(() => {
    // If no token is present in the URL on initial load, set an error
    // This condition ensures the error is set only once if the token is missing from the start.
    if (!token && !message && !error) {
      setError('No reset token provided. Please use the link from your email.');
    }
  }, [token, message, error]); // Depend on token, message, and error to avoid re-setting if already handled

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(''); // Clear previous messages
    setError(null); // Clear previous errors

    if (!token) {
      setError('No reset token available. Please request a new link.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) { // Basic password length validation
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message); // Should be "Password has been reset successfully."
      setPassword('');
      setConfirmPassword('');

      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);

    } catch (err) {
      console.error("Error resetting password:", err);
      // If the error is due to an invalid/expired token from the backend, set a specific error
      if (err.message.includes('Invalid or expired token')) {
        setError('Invalid or expired token. Please request a new password reset link.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional rendering for "Invalid or Missing Token" block
  // This block will only render if there's no token initially AND an error is set
  if (!token && error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-6">Invalid or Missing Token</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Request a new password reset link
          </Link>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Main form rendering
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h1>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline"> {message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirm your new password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
