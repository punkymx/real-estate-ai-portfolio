// src/components/providers/NextAuthProvider.js
'use client'; // This component must be a client component

import { SessionProvider } from 'next-auth/react';
import React from 'react'; // React is needed for JSX

export default function NextAuthProvider({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
