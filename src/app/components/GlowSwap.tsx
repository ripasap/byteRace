import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Assuming ThemeContext is already defined for managing themes

interface GlowSwapProps {
    onConfirm: () => void;
    handleClose: () => void;
}

const GlowSwap: React.FC<GlowSwapProps> = ({ onConfirm, handleClose }) => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { setTheme, colors } = themeContext;

    // Activate GlowSwap and change the theme to 'ludicrous'
    const activateGlowSwap = () => {
        setTheme('ludicrous');  // Explicitly switch to the ludicrous theme
        onConfirm();  // Trigger confirm action (close the modal or other actions)
    };

    return (
        <div style={{ padding: '20px', backgroundColor: colors.background, color: colors.text }}>
            <h2>Glow Swap Activated!</h2>
            <p>Forcing your opponent to switch to the ludicrous theme with intense, glowing colors.</p>
            <button
                onClick={activateGlowSwap}
                style={{
                    backgroundColor: colors.buttonBackground,
                    color: colors.text,
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px',
                }}
            >
                Confirm
            </button>
            <button
                onClick={handleClose}
                style={{
                    backgroundColor: colors.buttonBackground,
                    color: colors.text,
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    marginLeft: '10px',
                }}
            >
                Cancel
            </button>
        </div>
    );
};

export default GlowSwap;
