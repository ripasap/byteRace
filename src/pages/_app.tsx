import React, { useState, useEffect } from 'react';
import '../app/globals.css';
import Loading from '../app/components/Loading';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../app/context/AuthContext';
import type { AppProps } from 'next/app';


const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handlePageLoad = () => {
            setLoading(false);
        };

        if (document.readyState === 'complete') {
            setLoading(false);
        } else {
            window.addEventListener('load', handlePageLoad);
        }

        return () => {
            window.removeEventListener('load', handlePageLoad);
        };
    }, []);

    return (
        <AuthProvider>
            <ThemeProvider>
                {loading ? <Loading /> : <Component {...pageProps} />}
            </ThemeProvider>
        </AuthProvider>
    );
};

export default MyApp;