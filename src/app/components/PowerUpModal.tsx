import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext


interface ModalProps {
    show: boolean;
    handleClose: () => void;
    children: React.ReactNode;

}

const PowerUpModal: React.FC<ModalProps> = ({ show, handleClose, children }) => {
    if (!show) return null;



    const themeContext = useContext(ThemeContext);

    // Safety check to ensure ThemeContext is defined
    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>&times;</span>
                {children}
            </div>

            <style jsx>{`
                .modal {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);  /* Slightly darker backdrop */
                }

                .modal-content {
                    background-color: ${colors.powerUpModal.background};  /* Use modal background from theme */
                    padding: 25px;
                    border-radius: 20px;
                    text-align: center;
                    width: 350px;  /* Slightly wider */
                    color: ${colors.powerUpModal.text};  /* Use modal text color from theme */
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);  /* Shadow for depth */
                    animation: fadeIn 0.3s ease-in-out;
                }

                .close {
                    color: ${colors.powerUpModal.closeButton};  /* Use modal close button color from theme */
                    float: right;
                    font-size: 30px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }

                .close:hover {
                    color: ${colors.powerUpModal.closeButtonHover};  /* Softer hover effect */
                }

                h2 {
                    font-size: 28px;
                    margin-bottom: 15px;
                    background: linear-gradient(90deg, ${colors.powerUpModal.titleGradientStart}, ${colors.powerUpModal.titleGradientEnd});  /* Gradient for modal title */
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    font-weight: bold;
                }

                p {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: ${colors.powerUpModal.text};  /* Softer text for the description */
                    line-height: 1.5;
                }

                button {
                    background-color: ${colors.powerUpModal.buttonBackground};  /* Modal button background */
                    color: ${colors.powerUpModal.buttonText};  /* Modal button text */
                    border: none;
                    padding: 12px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                }

                button:hover {
                    background-color: ${colors.powerUpModal.titleGradientEnd}; /* Lighter pink on hover */
                    transform: scale(1.05);  /* Slight zoom effect */
                }

                button:active {
                    transform: scale(0.98);  /* Slight shrink on click */
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PowerUpModal;