import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import { getShadows } from '../../context/shadows';

interface ModalProps {
    show: boolean;
    handleClose: () => void;
    isHostModal: boolean;
    ws: WebSocket | null;
    roomCode: string;
    serverStatus: string;
    userId: string | undefined;
}

const Modal: React.FC<ModalProps> = ({ show, handleClose, isHostModal, ws, roomCode, serverStatus, userId }) => {
    const [inputValue, setInputValue] = useState<string>('');

    const themeContext = useContext(ThemeContext);  // Use the theme context

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors, theme } = themeContext;  // Destructure colors from the theme context
    const currentShadows = getShadows(theme);



    const [copied, setCopied] = useState(false);

    // Function to create a room (for hosts)
    const createRoom = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: "createRoom", userId }));
        }
    };

    const handleRoomCodeClick = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            createRoom();
        }
    };

    // Function to join a room (for players)
    const joinRoom = () => {
        if (ws && inputValue) {
            ws.send(JSON.stringify({ type: "joinRoom", roomCode: inputValue, userId }));
        }
    };

    if (!show) return null; // If modal is not shown, render nothing

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>&times;</span>
                <h3>{isHostModal ? "Host a Game" : "Join a Game"}</h3>

                {isHostModal ? (
                    <>
                        <button onClick={handleRoomCodeClick} className="create-room-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {roomCode ? (
                                copied ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        Room Code: {roomCode}
                                    </>
                                )
                            ) : "Create Room"}
                        </button>
                        {roomCode && (
                            <p>
                                Share this code with another player: <strong>{roomCode}</strong>
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter Room Code"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}  // Update input state
                        />
                        <button onClick={joinRoom} className="join-room-btn">
                            Join Room
                        </button>
                    </>
                )}

                {/* Show the server status to the user */}
                <p>{serverStatus}</p>
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
                    background-color: rgba(0, 0, 0, 0.5);
                }

                .modal-content {
                    background-color: ${colors.background};
                    color: ${colors.text};
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    width: 300px;
                    boxShadow: ${currentShadows.elevated};
                }

                .close {
                    color: ${colors.text};
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .close:hover {
                    color: ${colors.text};
                }

                button {
                    background-color: ${colors.buttonBackground};
                    color: ${colors.text};
                    border: none;
                    padding: 10px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }

                button:hover {
                    background-color: ${colors.buttonBackground};
                }

                input {
                    padding: 10px;
                    width: 80%;
                    border-radius: 5px;
                    border: 1px solid ${colors.buttonBackground};
                    margin-bottom: 10px;
                    background-color: ${colors.background};
                    color: ${colors.text};
                }

                p {
                    margin-top: 10px;
                    font-size: 14px;
                    color: ${colors.text};
                }

                strong {
                    color: ${colors.text};
                }
            `}</style>
        </div>
    );
};

export default Modal;
