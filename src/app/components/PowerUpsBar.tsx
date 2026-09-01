import React, { useState, useContext } from 'react';
import PowerUpModal from './PowerUpModal'; // Correct import for PowerUpModal component
import Image from 'next/image';
import FlashIcon from '../icons/FlashIcon';
import MushroomIcon from '../icons/MushroomIcon';
import DamageIcon from '../icons/DamageIcon';
import DeleteIcon from '../icons/DeleteIcon';
import StopWatchIcon from '../icons/StopWatchIcon';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import GlowSwap from './GlowSwap';  // Import GlowSwap component


interface PowerUp {
    name: string;
    description: string;
    icon: JSX.Element;
    color: string;
    mode: 'single' | 'multiplayer';  // Ensure mode is part of the props interface mode: 'single' | 'multiplayer';
}

const powerUps: PowerUp[] = [
    { name: 'Flashbang', description: 'Blinds your opponent and disables input for 1.5 seconds.', icon: <FlashIcon style={{ width: '28px', height: '28px', display: 'block' }} />, color: '#ffffff', mode: 'multiplayer' },
    { name: 'Critical Hit', description: "Take out a random line of opponent's code.", icon: <DamageIcon style={{ width: '28px', height: '28px', display: 'block' }} />, color: '#ffa500', mode: 'multiplayer' },
    { name: 'Trash Talk', description: 'Send an annoying message popup to your opponent.', icon: <DeleteIcon />, color: '#00bfff', mode: 'multiplayer' },
    { name: 'Bad Trip', description: 'Switch your opponent\'s theme to ludicrous mode.', icon: <MushroomIcon style={{ width: '28px', height: '28px', display: 'block' }} />, color: '#8a2be2', mode: 'multiplayer' },
    { name: 'Async Await', description: 'Stops timer and prevents opponent from submitting for 30 seconds.', icon: <StopWatchIcon />, color: '#ffd700', mode: 'multiplayer' },
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
                case 'Critical Hit':
                    console.log('Critical Hit activated!');
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        ws.send(JSON.stringify({ type: 'powerUp', name: 'Critical Hit', roomCode }));
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
                case 'Bad Trip':
                    console.log('Bad Trip activated!');
                    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
                        ws.send(JSON.stringify({ type: 'powerUp', name: 'Bad Trip', roomCode }));
                        powerupSent = true;
                    } else {
                        alert("You must be in a multiplayer room to use this powerup!");
                    }
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
                    <h1 style={{ fontSize: '1.2em' }}>{selectedPowerUp.name}</h1>
                    <p>{selectedPowerUp.description}</p>
                    <button onClick={activatePowerUp} style={{
                        backgroundColor: colors.buttonBackground,
                        color: colors.text,
                        padding: '10px 20px',
                        border: '1px solid',
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
