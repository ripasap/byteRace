import { WebSocketServer, WebSocket } from 'ws';

const PORT = parseInt(process.env.PORT || '8080', 10);
const wss = new WebSocketServer({ port: PORT });

/**
 * Rooms map: roomCode -> {
 *   players: WebSocket[],
 *   winners: number[],
 *   currentIndex: number,
 *   readyForNext: WebSocket[]
 * }
 */
const rooms = new Map();

// Helper to safely send JSON stringified messages
function safeSend(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        try {
            ws.send(JSON.stringify(data));
        } catch (err) {
            console.error('Error sending WebSocket message:', err);
        }
    }
}

// Helper to broadcast to other players in a room
function broadcastToOthers(room, senderWs, data) {
    if (!room || !Array.isArray(room.players)) return;
    room.players.forEach(player => {
        if (player !== senderWs) {
            safeSend(player, data);
        }
    });
}

// Helper to broadcast to all players in a room
function broadcastToAll(room, data) {
    if (!room || !Array.isArray(room.players)) return;
    room.players.forEach(player => {
        safeSend(player, data);
    });
}

// Helper to clean up player leaving
function handlePlayerExit(ws, roomCode) {
    if (!roomCode || !rooms.has(roomCode)) return;
    const room = rooms.get(roomCode);
    const playerIndex = room.players.indexOf(ws);

    if (playerIndex !== -1) {
        // Remove from players array
        room.players = room.players.filter(p => p !== ws);
        // Remove from readyForNext array
        room.readyForNext = room.readyForNext.filter(p => p !== ws);

        // Notify remaining players
        broadcastToAll(room, { type: 'playerLeft', playerIndex });

        console.log(`Player ${playerIndex} left room ${roomCode}. Remaining: ${room.players.length}`);
    }

    if (room.players.length === 0) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted.`);
    }
}

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');

    ws.on('message', (rawMessage) => {
        let data;
        try {
            data = JSON.parse(rawMessage.toString());
        } catch (err) {
            console.error('Received invalid JSON from client:', err.message);
            safeSend(ws, { type: 'error', message: 'Invalid JSON payload' });
            return;
        }

        if (!data || typeof data.type !== 'string') {
            safeSend(ws, { type: 'error', message: 'Missing message type' });
            return;
        }

        const { type } = data;

        try {
            if (type === 'createRoom') {
                const roomCode = Math.random().toString(36).substring(2, 8);
                const startingIndex = Math.floor(Math.random() * 1000);

                rooms.set(roomCode, {
                    players: [ws],
                    winners: [],
                    currentIndex: startingIndex,
                    readyForNext: []
                });

                ws.roomCode = roomCode;

                safeSend(ws, { type: 'roomCreated', roomCode, startingIndex });
                safeSend(ws, { type: 'playerJoined', playerIndex: 0 });
                console.log(`Room created with code: ${roomCode}`);

            } else if (type === 'joinRoom') {
                const roomCode = typeof data.roomCode === 'string' ? data.roomCode.trim() : '';
                const room = rooms.get(roomCode);

                if (room && room.players.length < 2) {
                    room.players.push(ws);
                    ws.roomCode = roomCode;

                    safeSend(ws, {
                        type: 'joinedRoom',
                        roomCode: roomCode,
                        startingIndex: room.currentIndex
                    });

                    // Notify all players in room that player 1 (guest) has joined
                    broadcastToAll(room, { type: 'playerJoined', playerIndex: 1 });

                    console.log(`Player joined room: ${roomCode}`);
                } else {
                    safeSend(ws, { type: 'error', message: 'Room full or does not exist' });
                    console.log(`Failed to join room: ${roomCode}`);
                }

            } else if (type === 'playerFinished') {
                const roomCode = ws.roomCode || data.roomCode;
                const room = rooms.get(roomCode);

                if (room) {
                    const playerIndex = room.players.indexOf(ws);
                    if (playerIndex !== -1 && !room.winners.includes(playerIndex)) {
                        room.winners.push(playerIndex);
                    }

                    if (room.winners.length === 1) {
                        broadcastToAll(room, { type: 'matchResult', winnerIndex: room.winners[0] });
                    } else if (room.winners.length === 2) {
                        broadcastToAll(room, { type: 'bothFinished' });
                    }
                }

            } else if (type === 'readyForNext') {
                const roomCode = ws.roomCode || data.roomCode;
                const room = rooms.get(roomCode);

                if (room) {
                    if (!room.readyForNext.includes(ws)) {
                        room.readyForNext.push(ws);
                    }

                    if (room.readyForNext.length >= 2) {
                        room.winners = [];
                        room.readyForNext = [];
                        const nextIndex = Math.floor(Math.random() * 1000);
                        room.currentIndex = nextIndex;
                        broadcastToAll(room, { type: 'nextQuestion', nextIndex });
                    }
                }

            } else if (type === 'powerUp') {
                const roomCode = ws.roomCode || data.roomCode;
                const room = rooms.get(roomCode);

                if (room) {
                    broadcastToOthers(room, ws, { ...data, type: 'powerUp' });
                }

            } else if (type === 'codeUpdate') {
                const roomCode = ws.roomCode || data.roomId || data.roomCode;
                const room = rooms.get(roomCode);

                if (room) {
                    broadcastToOthers(room, ws, {
                        type: 'codeUpdate',
                        roomId: roomCode,
                        code: data.code
                    });
                }

            } else if (type === 'leaveRoom') {
                const roomCode = ws.roomCode || data.roomCode;
                handlePlayerExit(ws, roomCode);
                ws.roomCode = null;
            }
        } catch (err) {
            console.error(`Error processing message type "${type}":`, err);
            safeSend(ws, { type: 'error', message: 'Internal server error processing action' });
        }
    });

    ws.on('close', () => {
        const roomCode = ws.roomCode;
        if (roomCode) {
            handlePlayerExit(ws, roomCode);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
    });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);