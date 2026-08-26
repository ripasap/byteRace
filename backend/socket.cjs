import { Server } from "socket.io";  // Use import instead of require

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server);

        io.on('connection', (socket) => {
            console.log("New connection:", socket.id);

            // Room creation
            socket.on('createRoom', () => {
                const roomCode = Math.random().toString(36).substring(2, 8); // Generate 6-character code
                socket.join(roomCode);
                socket.emit('roomCreated', roomCode);
            });

            // Joining a room
            socket.on('joinRoom', (roomCode) => {
                const room = io.sockets.adapter.rooms.get(roomCode);
                if (room && room.size === 1) {
                    socket.join(roomCode);
                    io.in(roomCode).emit('playerJoined', socket.id);
                } else {
                    socket.emit('error', 'Room does not exist or is full');
                }
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;  // Use export instead of module.exports