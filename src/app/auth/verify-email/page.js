// src/app/auth/verify-email/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [isLoadingResend, setIsLoadingResend] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if a success message is already present from a backend redirect
      const successMessageFromUrl = searchParams.get('message');
      if (successMessageFromUrl) {
        setVerificationStatus('success');
        setMessage(successMessageFromUrl);
        return; // Exit if already successfully redirected
      }

      // If no token or email, show error immediately
      if (!token || !email) {
        setVerificationStatus('error');
        setMessage('Missing verification token or email. Please use the link from your email.');
        return;
      }

      // If no success message from URL, proceed with API call from frontend
      try {
        setVerificationStatus('loading'); // Ensure loading state is set
        setMessage('Verifying your email...');

        const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`, {
          method: 'GET', // Explicitly use GET
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // If API call is successful, it means backend didn't redirect, but processed.
        // Or, if it did redirect, we would have caught it with successMessageFromUrl.
        // So, if we reach here, it implies success from the API call itself.
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now sign in.');

      } catch (err) {
        console.error("Error during email verification API call:", err);
        setVerificationStatus('error');
        setMessage(err.message || 'An unexpected error occurred during verification. Please try again or request a new link.');
      }
    };

    verifyEmail();
  }, [token, email, searchParams]); // Re-run effect if token, email, or searchParams change

  const handleResendVerificationEmail = async () => {
    setIsLoadingResend(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setMessage('Verification link re-sent! Please check your email.');
      setVerificationStatus('success'); // Show success message after resend
    } catch (err) {
      console.error("Error re-sending verification email:", err);
      setMessage(err.message || 'Failed to re-send verification link. Please try again.');
      setVerificationStatus('error'); // Keep error status if resend fails
    } finally {
      setIsLoadingResend(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {verificationStatus === 'loading' && (
          <>
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Verifying Your Email...</h1>
            <p className="text-gray-700">Please wait while we confirm your account.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-6">Email Verified!</h1>
            <p className="text-gray-700 mb-6">{message}</p>
            <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
              Go to Sign In
            </Link>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-6">Verification Failed</h1>
            <p className="text-gray-700 mb-6">{message}</p>
            <button
              onClick={handleResendVerificationEmail}
              disabled={isLoadingResend || !email}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {isLoadingResend ? 'Sending...' : 'Request a new verification link'}
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
