'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';

export default function RootLayoutClient({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="h-[calc(100vh-64px)]">{children}</main>
      </div>
    </SessionProvider>
  );
}
