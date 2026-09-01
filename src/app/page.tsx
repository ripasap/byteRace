'use client';  // This ensures the component is rendered on the client

import React, { useState, useEffect } from 'react';
import Home from '../app/components/Home';  // Path to your Home component
import { ThemeProvider } from '../../src/context/ThemeContext';  // Correct path to ThemeContext
import Loading from '../app/components/Loading';  // Import your Loading screen

const Page: React.FC = () => {
    const [loading, setLoading] = useState(true);  // Initialize loading state

    useEffect(() => {
        const handlePageLoad = () => {
            setLoading(false);  // Set loading to false once the page is fully loaded
        };

        // Check if the document is already loaded
        if (document.readyState === 'complete') {
            setLoading(false);  // If already loaded, no need to wait for the event
        } else {
            window.addEventListener('load', handlePageLoad);
        }

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('load', handlePageLoad);
        };
    }, []);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: 'ByteRace',
        description: 'A fast-paced multiplayer coding game with real-time programming challenges and rankings.',
        applicationCategory: 'Game',
        genre: ['Puzzle', 'Educational'],
        operatingSystem: 'Web browser',
        url: 'https://byterace.app/',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <ThemeProvider>
                {loading ? <Loading /> : <Home />}  {/* Show loading screen while the page is loading */}
            </ThemeProvider>
        </>
    );
};

export default Page;
