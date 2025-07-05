// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from '@/components/providers/NextAuthProvider'; // Your existing SessionProvider wrapper
import Header from '@/components/Header'; // <-- Import the new Header component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Real Estate Portfolio",
  description: "Manage your real estate properties with AI insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          {/* Add the Header component here, before children */}
          <Header />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
// This layout wraps your entire application with the NextAuthProvider and includes the Header component.
// The Header component will be displayed on every page, providing a consistent navigation experience.