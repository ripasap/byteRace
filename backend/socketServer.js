import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const rooms = {};

wss.on('connection', (ws) => {
    console.log('New connection established.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'createRoom') {
            const roomCode = Math.random().toString(36).substring(2, 8);
            const startingIndex = Math.floor(Math.random() * 1000);
            rooms[roomCode] = { players: [ws], winners: [], currentIndex: startingIndex, readyForNext: [] };
            ws.roomCode = roomCode;
            ws.send(JSON.stringify({ type: 'roomCreated', roomCode, startingIndex }));
            // Also notify the host that they are player 0
            ws.send(JSON.stringify({ type: 'playerJoined', playerIndex: 0 }));
            console.log(`Room created with code: ${roomCode}`);

        } else if (data.type === 'joinRoom') {
            const room = rooms[data.roomCode];
            if (room && room.players.length < 2) {
                room.players.push(ws);
                ws.roomCode = data.roomCode;

                ws.send(JSON.stringify({ type: 'joinedRoom', roomCode: data.roomCode, startingIndex: room.currentIndex }));
                // Notify both players in the room about everyone who is connected
                room.players.forEach((player, index) => {
                    // Send to everyone that player 1 (guest) has joined
                    player.send(JSON.stringify({ type: 'playerJoined', playerIndex: 1 }));
                });
                console.log(`Player joined room: ${data.roomCode}`);
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Room full or does not exist' }));
                console.log(`Failed to join room: ${data.roomCode}`);
            }
        } else if (data.type === 'playerFinished') {
            const room = rooms[data.roomCode];
            if (room) {
                const playerIndex = room.players.indexOf(ws);
                if (!room.winners.includes(playerIndex)) {
                    room.winners.push(playerIndex);
                }
                
                if (room.winners.length === 1) {
                    room.players.forEach(p => p.send(JSON.stringify({ type: 'matchResult', winnerIndex: room.winners[0] })));
                } else if (room.winners.length === 2) {
                    room.players.forEach(p => p.send(JSON.stringify({ type: 'bothFinished' })));
                }
            }
        } else if (data.type === 'readyForNext') {
            const room = rooms[data.roomCode];
            if (room) {
                if (!room.readyForNext.includes(ws)) {
                    room.readyForNext.push(ws);
                }
                
                if (room.readyForNext.length === 2) {
                    // Reset winners and readiness for the next question
                    room.winners = [];
                    room.readyForNext = [];
                    const nextIndex = Math.floor(Math.random() * 1000);
                    room.currentIndex = nextIndex;
                    room.players.forEach(p => p.send(JSON.stringify({ type: 'nextQuestion', nextIndex })));
                }
            }
        } else if (data.type === 'powerUp') {
            const room = rooms[data.roomCode];
            if (room) {
                // Send the powerup to the OTHER player
                room.players.forEach(p => {
                    if (p !== ws) {
                        p.send(JSON.stringify({ ...data, type: 'powerUp' }));
                    }
                });
            }
        } else if (data.type === 'leaveRoom') {
            const room = rooms[data.roomCode];
            if (room) {
                const playerIndex = room.players.indexOf(ws);
                room.players = room.players.filter(p => p !== ws);
                room.players.forEach(p => p.send(JSON.stringify({ type: 'playerLeft', playerIndex })));
                if (room.players.length === 0) {
                    delete rooms[data.roomCode];
                }
            }
        }
    });

    ws.on('close', () => {
        const roomCode = ws.roomCode;
        if (roomCode && rooms[roomCode]) {
            const playerIndex = rooms[roomCode].players.indexOf(ws);
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p !== ws);
            rooms[roomCode].players.forEach(p => p.send(JSON.stringify({ type: 'playerLeft', playerIndex })));
            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
                console.log(`Room ${roomCode} deleted.`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket server running on ws://localhost:8080');