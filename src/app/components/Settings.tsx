import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';  // Import the ThemeContext

const Settings: React.FC = () => {

    // Access the theme context
    const themeContext = useContext(ThemeContext);

    // Safety check to ensure ThemeContext is not undefined
    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Make sure you are using ThemeProvider to wrap the component.');
    }

    const { theme, setTheme, colors } = themeContext;

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'ludicrous') => {
        setTheme(newTheme);  // Change to the selected theme
    };

    // Accent color for active button in each theme
    const getActiveButtonColor = (currentTheme: 'light' | 'dark' | 'ludicrous') => {
        switch (currentTheme) {
            case 'light':
                return '#a0a0a0';  // Darker gray for light mode active button
            case 'dark':
                return '#444';  // Lighter gray for dark mode active button
            case 'ludicrous':
                return '#ff1493';  // Bright pink for ludicrous mode active button
            default:
                return colors.buttonTextRun;  // Fallback to theme's default button text run
        }
    };

    // Set the default button style for non-selected themes
    const getInactiveButtonStyle = () => ({
        backgroundColor: colors.buttonBackground,  // Non-selected themes use the current theme's button background
        color: colors.text,  // Text matches the current theme
    });

    // Set the active button style for the selected theme
    const getActiveButtonStyle = (currentTheme: 'light' | 'dark' | 'ludicrous') => ({
        backgroundColor: getActiveButtonColor(currentTheme),  // Highlight active theme with accent color
        color: colors.text,  // Text still matches the current theme
    });

    return (
        <div style={{ padding: '20px', backgroundColor: colors.background, color: colors.text }}>
            <h2 style={{ color: colors.text }}>Settings</h2>

            {/* Theme Selection Section */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ color: colors.text }}>Theme: </label>
                <div style={{ marginTop: '10px' }}>
                    <button
                        onClick={() => handleThemeChange('light')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '10px',
                            ...(theme === 'light' ? getActiveButtonStyle('light') : getInactiveButtonStyle())
                        }}
                    >
                        Light Mode
                    </button>
                    <button
                        onClick={() => handleThemeChange('dark')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '10px',
                            ...(theme === 'dark' ? getActiveButtonStyle('dark') : getInactiveButtonStyle())
                        }}
                    >
                        Dark Mode
                    </button>
                    <button
                        onClick={() => handleThemeChange('ludicrous')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            ...(theme === 'ludicrous' ? getActiveButtonStyle('ludicrous') : getInactiveButtonStyle())
                        }}
                    >
                        Ludicrous Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
