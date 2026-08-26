// pages/api/socket.js
import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
    if (!io) {
        // Initialize the Socket.IO server only once
        io = new Server(res.socket.server, {
            path: '/api/socket', // Specify the path for Socket.IO
        });

        // Listen for new connections
        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Handle room creation
            socket.on('createRoom', (code) => {
                console.log(`Room created with code: ${code}`);
                socket.join(code);
                socket.emit('roomCreated', code); // Notify client that room was created
            });

            // Handle joining a room
            socket.on('joinRoom', (code) => {
                const room = io.sockets.adapter.rooms.get(code);

                if (room) {
                    if (room.size < 2) {
                        socket.join(code);
                        socket.emit('playerJoined'); // Notify the joining player
                        io.to(code).emit('playerJoined', socket.id); // Notify all players in the room
                    } else {
                        socket.emit('roomFull'); // Notify that room is full
                    }
                } else {
                    socket.emit('roomNotFound'); // Room does not exist
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        res.socket.server.io = io; // Attach Socket.IO to the server
        console.log('Socket.IO server initialized');
    } else {
        console.log('Socket.IO server already running');
    }

    res.end();
}