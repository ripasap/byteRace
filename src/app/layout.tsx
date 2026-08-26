// src/app/layout.tsx

"use client";

import './globals.css';
import React from "react";
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}