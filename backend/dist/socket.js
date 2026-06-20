"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.sendSocketNotification = sendSocketNotification;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow all origins for simplicity in local and ngrok tunnels
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(userId);
            console.log(`[Socket] User ${userId} connected and joined room.`);
        }
        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
    console.log('[Socket] Socket.io server initialized.');
    return io;
}
function sendSocketNotification(userId, message) {
    if (io) {
        io.to(userId).emit('notification', {
            id: Date.now().toString(),
            message,
            createdAt: new Date(),
        });
        console.log(`[Socket] Sent notification to user ${userId}: "${message}"`);
    }
    else {
        console.warn('[Socket] Socket server not initialized yet.');
    }
}
