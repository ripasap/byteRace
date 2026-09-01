import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
    background: string;
    text: string;
    buttonBackground: string;
    buttonTextRun: string;
    buttonTextSubmit: string;
    header: string;
    cardBackground: string;
    powerUpModal: {
        background: string;
        text: string;
        buttonBackground: string;
        buttonText: string;
        closeButton: string;
        closeButtonHover: string;
        titleGradientStart: string;
        titleGradientEnd: string;
    };
}

// Define three themes: light, dark, and ludicrous
const lightTheme: ThemeColors = {
    background: '#e8eaed',
    text: '#202124',
    buttonBackground: '#dadce0',
    buttonTextRun: '#856404', // Dark goldenrod for better contrast in light mode
    buttonTextSubmit: '#0f5132', // Dark green for better contrast in light mode
    header: '#000',
    cardBackground: '#ffffff',
    powerUpModal: {
        background: '#ffffff',
        text: '#202124',
        buttonBackground: '#dadce0',
        buttonText: '#202124',
        closeButton: '#d93025',
        closeButtonHover: '#ff8888',
        titleGradientStart: '#d4af00', // Updated gradient start to match darker yellow
        titleGradientEnd: '#ff007f',
    },
};

const darkTheme: ThemeColors = {
    background: '#161617',
    text: '#ffffff',
    buttonBackground: '#1f1f1f',
    buttonTextRun: '#FFDD00',
    buttonTextSubmit: '#00FF00',
    header: '#ffffff',
    cardBackground: '#1e1e1e',
    powerUpModal: {
        background: '#1e1e1e',
        text: '#ffffff',
        buttonBackground: '#ff007f',
        buttonText: '#ffffff',
        closeButton: '#ff5555',
        closeButtonHover: '#ff8888',
        titleGradientStart: '#ffdd00',
        titleGradientEnd: '#ff007f',
    },
};

const ludicrousTheme: ThemeColors = {
    background: '#4B0082', // Indigo
    text: '#00FF00', // Bright Green
    buttonBackground: '#FF1493', // Deep Pink
    buttonTextRun: '#FFFFFF', // White
    buttonTextSubmit: '#FFFFFF', // White
    header: '#FFD700', // Gold
    cardBackground: '#8A2BE2', // Blue Violet
    powerUpModal: {
        background: '#4B0082',
        text: '#00FF00',
        buttonBackground: '#FF1493',
        buttonText: '#FFFFFF',
        closeButton: '#FF0000',
        closeButtonHover: '#FF4500',
        titleGradientStart: '#00FFFF',
        titleGradientEnd: '#FF1493',
    },
};

interface ThemeContextProps {
    theme: 'light' | 'dark' | 'ludicrous';
    colors: ThemeColors;
    setTheme: (newTheme: 'light' | 'dark' | 'ludicrous') => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark' | 'ludicrous'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'ludicrous';
            return savedTheme || 'light';
        }
        return 'light';
    });

    const [colors, setColors] = useState<ThemeColors>(lightTheme);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        switch (theme) {
            case 'light':
                setColors(lightTheme);
                break;
            case 'dark':
                setColors(darkTheme);
                break;
            case 'ludicrous':
                setColors(ludicrousTheme);
                break;
            default:
                setColors(lightTheme);
        }
    }, [theme]);

    const handleSetTheme = (newTheme: 'light' | 'dark' | 'ludicrous') => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
