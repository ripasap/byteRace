import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext

interface InputFieldProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, value, onChange }) => {
    const themeContext = useContext(ThemeContext);  // Access the ThemeContext

    if (!themeContext) {
        console.error('ThemeContext is unavailable!');
        return null;
    }

    const { colors } = themeContext;  // Destructure colors from the theme

    // Dynamically apply placeholder color using CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty('--placeholder-color', colors.text); // Set CSS variable
    }, [colors.text]);

    return (
        <input
            type={type}
            placeholder={placeholder}
            className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
            value={value}
            onChange={onChange}
            style={{
                backgroundColor: colors.background,  // Dynamic background color
                color: colors.text,  // Dynamic text color
                borderColor: colors.buttonBackground,  // Optional border color for input field
            }}
        />
    );
};

export default InputField;
