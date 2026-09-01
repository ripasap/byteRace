import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faGamepad, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import UserMenu from "./UserMenu";
import { ThemeContext } from '../../context/ThemeContext';
import PlayerStatus from './PlayerStatus';
import { getShadows } from '../../context/shadows';

import { User } from '../context/AuthContext';

interface NavbarProps {
    setShowJoinModal: (value: boolean) => void;
    setShowHostModal: (value: boolean) => void;
    mode: string;
    setMode: (mode: "single" | "multiplayer") => void;
    connectedPlayers: boolean[];
    user: User | null;
    roomCode?: string;
    leaveRoom?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ setShowJoinModal, setShowHostModal, mode, setMode, connectedPlayers, user, roomCode, leaveRoom }) => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors, theme } = themeContext;
    const currentShadows = getShadows(theme);



    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: colors.background,
                padding: "5px 15px",
                borderRadius: "10px",
                boxShadow: currentShadows.card,
                margin: "10px auto",
                height: "60px",
                color: colors.text,
                maxWidth: "1200px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                    style={{ ...buttonStyles, color: colors.text, backgroundColor: colors.buttonBackground }}
                    onClick={() => window.location.href = '/rankings'}
                >
                    <FontAwesomeIcon icon={faTrophy} /> Rankings
                </button>
                <button
                    onClick={() => {
                        if (mode === "single" || roomCode) return;
                        if (!user) {
                            alert("You must sign in first before playing multiplayer.");
                            return;
                        }
                        setShowJoinModal(true);
                    }}
                    style={{
                        ...buttonStyles,
                        color: mode === "single" || !!roomCode ? "#646464ff" : colors.text,
                        backgroundColor: mode === "single" || !!roomCode ? "#222" : colors.buttonBackground,
                        cursor: mode === "single" || !!roomCode ? "not-allowed" : "pointer"
                    }}
                    disabled={mode === "single" || !!roomCode}
                    title={mode === "single" ? "Multiplayer features are disabled in single-player mode" : roomCode ? "You are already in a game" : ""}
                >
                    <FontAwesomeIcon icon={faGamepad} /> Join a Game
                </button>
                <button
                    onClick={() => {
                        if (mode === "single" || roomCode) return;
                        if (!user) {
                            alert("You must sign in first before playing multiplayer.");
                            return;
                        }
                        setShowHostModal(true);
                    }}
                    style={{
                        ...buttonStyles,
                        color: mode === "single" || !!roomCode ? "#555" : colors.text,
                        backgroundColor: mode === "single" || !!roomCode ? "#222" : colors.buttonBackground,
                        cursor: mode === "single" || !!roomCode ? "not-allowed" : "pointer"
                    }}
                    disabled={mode === "single" || !!roomCode}
                    title={mode === "single" ? "Multiplayer features are disabled in single-player mode" : roomCode ? "You are already in a game" : ""}
                >
                    <FontAwesomeIcon icon={faUserFriends} /> Host a Game
                </button>

                <div style={{ marginLeft: 'auto', marginRight: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PlayerStatus connectedPlayers={connectedPlayers} />
                    {roomCode && (
                        <button
                            onClick={leaveRoom}
                            style={{
                                ...buttonStyles,
                                width: 'auto',
                                padding: '8px 12px',
                                backgroundColor: '#ff4c4c',
                                color: '#fff',
                            }}
                            title="Leave Room"
                        >
                            Leave
                        </button>
                    )}
                </div>
            </div>

            <div
                style={{
                    position: "relative",
                    width: "188px",
                    height: "36px",
                    backgroundColor: colors.buttonBackground,
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 5px",
                    cursor: roomCode ? "not-allowed" : "pointer",
                    opacity: roomCode ? 0.6 : 1,
                }}
                onClick={() => {
                    if (roomCode) return;
                    setMode(mode === "single" ? "multiplayer" : "single");
                }}
                title={roomCode ? "Cannot change mode while in a room" : ""}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "3px",
                        left: mode === "single" ? "3px" : "calc(100% - 93px)",
                        width: "88px",
                        height: "30px",
                        backgroundColor: theme === 'dark' ? '#2c2c2e' : colors.cardBackground,
                        borderRadius: "15px",
                        transition: "left 0.3s ease",
                        boxShadow: currentShadows.subtle,
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        zIndex: 1,
                    }}
                />
                <div
                    style={{
                        width: "50%",
                        textAlign: "center",
                        color: mode === "single" ? colors.text : (theme === 'ludicrous' ? "#ddd" : "#888"),
                        fontWeight: mode !== "single" && theme === 'ludicrous' ? "bold" : "normal",
                        zIndex: 2,
                        fontSize: "14px",
                    }}
                >
                    Single
                </div>
                <div
                    style={{
                        width: "50%",
                        textAlign: "center",
                        color: mode === "multiplayer" ? colors.text : (theme === 'ludicrous' ? "#ddd" : "#888"),
                        fontWeight: mode !== "multiplayer" && theme === 'ludicrous' ? "bold" : "normal",
                        zIndex: 2,
                        fontSize: "14px",
                    }}
                >
                    Multi
                </div>
            </div>

            <UserMenu buttonStyles={buttonStyles} />
        </nav>
    );
};

const buttonStyles = {
    color: "#aaaaaa",
    fontSize: "12px",
    cursor: "pointer",
    background: "none",
    outline: "none",
    padding: "8px",
    height: "50px",
    width: "120px",
    boxSizing: "border-box" as const,
    transition: "border-color 0.3s ease",
    border: "2px solid transparent",
    textAlign: "center" as const,
    borderRadius: "5px",
    backgroundColor: "#161617",

    "&:active": {
        transform: "translateY(2px)",
    },
};

export default Navbar;