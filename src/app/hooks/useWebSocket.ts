import { useState, useEffect } from "react";

interface WebSocketMessage {
    type: string;
    roomCode?: string; // Optional because not all messages include roomCode
    playerCount?: number;
}

interface WebSocketState {
    ws: WebSocket | null;
    opponentReady: boolean;
    gameStarted: boolean;
    setPlayerReady: () => void;
}

export const useWebSocket = (
    mode: "multiplayer" | "single",
    setRoomCode: (code: string) => void,
    setPlayerCount: (count: number) => void
): WebSocketState => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [opponentReady, setOpponentReady] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    // Function to notify the server that the player is ready
    const setPlayerReady = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'playerReady' }));
        }
    };

    useEffect(() => {
        if (mode === "multiplayer") {
            const newWs = new WebSocket("ws://localhost:3002");

            newWs.onopen = () => {
                console.log("Connected to WebSocket server.");
            };

            newWs.onerror = (error) => {
                console.error("WebSocket encountered an error:", error);
            };

            newWs.onclose = () => {
                console.log("Disconnected from WebSocket server.");
            };

            newWs.onmessage = (message) => {
                try {
                    const data: WebSocketMessage = JSON.parse(message.data);
                    console.log("WebSocket message received:", data);

                    switch (data.type) {
                        case "roomCreated":
                            if (data.roomCode) {
                                setRoomCode(data.roomCode); // Set the room code in the state
                                setPlayerCount(1); // Assume the room starts with 1 player
                            }
                            break;

                        case "playerCountUpdate":
                            if (data.playerCount !== undefined) {
                                setPlayerCount(data.playerCount);
                            }
                            break;

                        case "opponentReady":
                            setOpponentReady(true); // Mark opponent as ready
                            break;

                        case "matchStarted":
                            setGameStarted(true); // Mark the game as started
                            break;

                        default:
                            console.warn("Unhandled WebSocket message:", data.type);
                            break;
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", message.data, error);
                }
            };

            setWs(newWs);

            return () => {
                if (newWs) {
                    newWs.close();
                }
            };
        }
    }, [mode, setRoomCode, setPlayerCount]);

    return {
        ws,
        opponentReady,
        gameStarted,
        setPlayerReady,
    };
};