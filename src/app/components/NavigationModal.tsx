import React, { useState, useContext } from 'react';
import Settings from './Settings';  // Ensure the path is correct
import { ThemeContext } from '../../context/ThemeContext';  // Import ThemeContext

interface NavigationModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const NavigationModal: React.FC<NavigationModalProps> = ({ isVisible, onClose }) => {
    const [showSettings, setShowSettings] = useState(false);  // Toggle between navigation and settings
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    if (!isVisible) return null;  // Don't render the modal if it's not visible

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: colors.background,  // Use background color from theme
                padding: '30px',
                borderRadius: '15px',
                width: '400px',
                color: colors.text,  // Use text color from theme
                fontFamily: 'JetBrains Mono, monospace',
            }}>
                {showSettings ? (
                    <>
                        <h2 style={{ color: colors.text }}>Settings</h2>
                        <Settings />  {/* Render Settings component */}
                        <button
                            onClick={() => setShowSettings(false)}  // Back to navigation menu
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: colors.buttonBackground,  // Use button background from theme
                                color: colors.text,
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            Back to Menu
                        </button>
                    </>
                ) : (
                    <>
                        <h2 style={{ color: colors.text }}>Navigation</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>
                                <button
                                    onClick={() => setShowSettings(true)}  // Show settings view
                                    style={{
                                        backgroundColor: colors.buttonBackground,  // Use button background from theme
                                        color: colors.text,
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        width: '100%',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Settings
                                </button>
                            </li>
                            {/* You can add more navigation options here */}
                        </ul>
                        <button
                            onClick={onClose}  // Close the modal via this button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: colors.buttonBackground,
                                color: colors.text,
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NavigationModal;
