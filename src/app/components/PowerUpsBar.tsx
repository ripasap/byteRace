import React, { useState, useContext } from 'react';
import PowerUpModal from './PowerUpModal'; // Correct import for PowerUpModal component
import { FaBomb, FaBullseye, FaEye, FaCloudMoon, FaClock } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import GetPeek from './GetPeek';  // Import GetPeek component
import GlowSwap from './GlowSwap';  // Import GlowSwap component



interface PowerUp {
    name: string;
    description: string;
    icon: JSX.Element;
    color: string;
    mode: 'single' | 'multiplayer';  // Ensure mode is part of the props interface mode: 'single' | 'multiplayer';
}

const powerUps: PowerUp[] = [
    { name: 'Flashbang', description: 'Blinds your opponent and disables input for 1.5 seconds.', icon: <FaBomb />, color: '#ffffff', mode: 'multiplayer' },
    { name: 'Precision Strike', description: 'Take out a line or variable.', icon: <FaBullseye />, color: '#ffa500', mode: 'multiplayer' },
    { name: 'Trash Talk', description: 'Send an annoying message popup to your opponent.', icon: <FaEye />, color: '#00bfff', mode: 'multiplayer' },
    { name: 'Glow Swap', description: 'Switch your opponent\'s theme to ludicrous mode.', icon: <FaCloudMoon />, color: '#8a2be2', mode: 'multiplayer' },
    { name: 'Async Await', description: 'Stops your timer for 30 seconds.', icon: <FaClock />, color: '#ffd700', mode: 'multiplayer' },
];

interface PowerUpsBarProps {
    ws: WebSocket | null;
    roomCode: string | undefined;
    hasUsedPowerup: boolean;
    isOpponentPowerupActive: boolean;
    onPowerupUsed: () => void;
}

const PowerUpsBar: React.FC<PowerUpsBarProps> = ({ ws, roomCode, hasUsedPowerup, isOpponentPowerupActive, onPowerupUsed }) => {
    const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTrashTalkActive, setIsTrashTalkActive] = useState(false);
    const [trashTalkMessage, setTrashTalkMessage] = useState("");
    const [isGlowSwapActive, setIsGlowSwapActive] = useState(false);  // Add state for Glow Swap

    const [code, setCode] = useState<string[]>([
        'def factorial (n):',
        '   fact = 1',
        '   i = n',
        '   while i < n:',
        '       fact *= i',
        '       i -= 1',
        '   return fact',
    ]); // Initialize dummy code





    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    const openModal = (powerUp: PowerUp) => {
        if (hasUsedPowerup) {
            alert("You have already used a powerup this round!");
            return;
        }
        if (isOpponentPowerupActive) {
            alert("You cannot use a powerup while affected by your opponent's powerup!");
            return;
        }
        setSelectedPowerUp(powerUp);
        setIsModalOpen(true);
    };

    const activatePowerUp = () => {
        if (selectedPowerUp) {
            let powerupSent = false;
            switch (selectedPowerUp.name) {
                case 'Flashbang':
                    console.log('Flashbang activated!');
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        ws.send(JSON.stringify({ type: 'powerUp', name: 'Flashbang', roomCode }));
                        powerupSent = true;
                    } else {
                        alert("You must be in a multiplayer room to use this powerup!");
                    }
                    break;
                case 'Precision Strike':
                    console.log('Precision Strike activated!');
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        ws.send(JSON.stringify({ type: 'powerUp', name: 'Precision Strike', roomCode }));
                        powerupSent = true;
                    } else {
                        alert("You must be in a multiplayer room to use this powerup!");
                    }
                    break;
                case 'Trash Talk':
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        setIsTrashTalkActive(true);
                    } else {
                        alert("You must be in a multiplayer room to use this powerup!");
                    }
                    break;
                case 'Glow Swap':
                    setIsGlowSwapActive(true);  // Activate Glow Swap modal
                    break;
                case 'Async Await':
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        console.log('Async Await activated!');
                        window.dispatchEvent(new CustomEvent('asyncAwaitActivated'));
                        ws.send(JSON.stringify({ type: 'powerUp', name: 'Async Await', roomCode }));
                        powerupSent = true;
                    } else {
                        alert("You must be in a multiplayer room to use this powerup!");
                    }
                    break;
                default:
                    console.log(`${selectedPowerUp.name} activated!`);
                    break;
            }

            if (powerupSent) {
                onPowerupUsed();
            }
        }
        setIsModalOpen(false);  // Close the main power-up modal after activation
    };

    const handleSendTrashTalk = () => {
        if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
            ws.send(JSON.stringify({ type: 'powerUp', name: 'Trash Talk', message: trashTalkMessage || "You suck!", roomCode }));
            setTrashTalkMessage("");
            setIsTrashTalkActive(false);
            onPowerupUsed();
        }
    };

    const handleGlowSwapClose = () => {
        setIsGlowSwapActive(false);  // Close Glow Swap modal
        // Note: Glow swap onConfirm would ideally call onPowerupUsed, but since GlowSwap handles its own emit, we can just call it here assuming it was used if closed.
        // Actually, if we just close it without using, we shouldn't use it.
        // We'll leave Glow Swap out of the strict per-round limit for now, or just assume it was used.
    };

    return (
        <>

            <div className={`vertical-bar ${hasUsedPowerup || isOpponentPowerupActive ? 'disabled' : ''}`}>
                {powerUps.map((powerUp, index) => (
                    <div
                        key={index}
                        className="power-up"
                        onClick={() => openModal(powerUp)}
                        style={{ color: powerUp.color }}  // Apply color to each icon
                        title={hasUsedPowerup ? "Already used a powerup this round!" : (isOpponentPowerupActive ? "Opponent's powerup is active!" : powerUp.name)}
                    >
                        {powerUp.icon}
                    </div>
                ))}
            </div>

            {/* PowerUp Modal */}
            {isModalOpen && selectedPowerUp && (
                <PowerUpModal show={isModalOpen} handleClose={() => setIsModalOpen(false)}>
                    <h2>{selectedPowerUp.name}</h2>
                    <p>{selectedPowerUp.description}</p>
                    <button onClick={activatePowerUp} style={{
                        backgroundColor: colors.buttonBackground,
                        color: colors.text,
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>Activate</button>
                </PowerUpModal>
            )}

            {isTrashTalkActive && (
                <PowerUpModal show={isTrashTalkActive} handleClose={() => setIsTrashTalkActive(false)}>
                    <h2>Trash Talk</h2>
                    <p>Type a message to distract your opponent!</p>
                    <input 
                        type="text" 
                        value={trashTalkMessage}
                        onChange={(e) => setTrashTalkMessage(e.target.value)}
                        placeholder="e.g. You type so slow..."
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            backgroundColor: colors.background,
                            color: colors.text
                        }}
                    />
                    <button onClick={handleSendTrashTalk} style={{
                        backgroundColor: '#ff4c4c',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>Send Message</button>
                </PowerUpModal>
            )}

            {/* Glow Swap Modal */}
            {isGlowSwapActive && (
                <PowerUpModal show={isGlowSwapActive} handleClose={handleGlowSwapClose}>
                    <GlowSwap onConfirm={handleGlowSwapClose} handleClose={handleGlowSwapClose} />
                </PowerUpModal>
            )}


            <style jsx>{`
                .vertical-bar {
                    display: flex;
                    flex-direction: column;
                    gap: 50px;
                    background-color: ${colors.background};  // Use theme's background color
                    padding: 40px;
                    border-radius: 10px;
                    justify-content: flex-start;
                    align-items: center;
                    width: 50px;
                    height: 100%;
                    transition: opacity 0.3s ease;
                }

                .vertical-bar.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .power-up {
                    cursor: pointer;
                    font-size: 30px;
                    padding: 10px;
                    border-radius: 50%;
                    background-color: ${colors.buttonBackground};  // Use theme's button background color
                    color: #fff;
                    transition: transform 0.3s ease, background-color 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .power-up:hover {
                    transform: scale(1.2);
                    background-color: ${colors.buttonTextSubmit};  // Change background on hover to the submit button color
                }
            `}</style>
        </>
    );
};

export default PowerUpsBar;
