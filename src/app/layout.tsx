// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';
import React from "react";
import Providers from './Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://byterace.app'),
  title: {
    default: 'ByteRace | Multiplayer Coding Challenge',
    template: '%s | ByteRace',
  },
  description:
    'ByteRace is a fast-paced multiplayer coding game where you solve programming challenges, compete with friends, and climb the rankings.',
  keywords: ['coding game', 'programming challenges', 'multiplayer coding', 'competitive programming', 'ByteRace'],
  applicationName: 'ByteRace',
  authors: [{ name: 'ByteRace' }],
  creator: 'ByteRace',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'ByteRace',
    title: 'ByteRace | Multiplayer Coding Challenge',
    description: 'Compete in real-time coding challenges and climb the ByteRace rankings.',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'ByteRace | Multiplayer Coding Challenge',
    description: 'Compete in real-time coding challenges and climb the ByteRace rankings.',
  },
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#161617',
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
