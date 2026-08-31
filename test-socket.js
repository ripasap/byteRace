const WebSocket = require('ws');

const host = new WebSocket('ws://localhost:8080');

host.on('open', () => {
    host.send(JSON.stringify({ type: 'createRoom' }));
});

host.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log('Host received:', msg);
    
    if (msg.type === 'roomCreated') {
        const joiner = new WebSocket('ws://localhost:8080');
        joiner.on('open', () => {
            joiner.send(JSON.stringify({ type: 'joinRoom', roomCode: msg.roomCode }));
        });
        joiner.on('message', (joinerData) => {
            console.log('Joiner received:', JSON.parse(joinerData.toString()));
            process.exit(0);
        });
    }
});
