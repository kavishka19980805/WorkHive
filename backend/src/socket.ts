import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for simplicity in local and ngrok tunnels
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

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

export function sendSocketNotification(userId: string, message: string) {
  if (io) {
    io.to(userId).emit('notification', {
      id: Date.now().toString(),
      message,
      createdAt: new Date(),
    });
    console.log(`[Socket] Sent notification to user ${userId}: "${message}"`);
  } else {
    console.warn('[Socket] Socket server not initialized yet.');
  }
}
