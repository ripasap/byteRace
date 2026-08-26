const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Message received:', message);

        // Example of a message to client
        // Ensure every message is sent as a valid JSON string
        const response = {
            type: 'playerCountUpdate',
            playerCount: 2,  // or some dynamic value
        };

        ws.send(JSON.stringify(response));  // Send as a JSON string
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:3002');