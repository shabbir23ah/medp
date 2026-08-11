import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { sendMessage } from './services/chat.js';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Join a chat room for a specific appointment
    socket.on('chat:join', (appointmentId: string) => {
      socket.join(`chat:${appointmentId}`);
      console.log(`[WS] ${socket.id} joined chat:${appointmentId}`);
    });

    socket.on('chat:leave', (appointmentId: string) => {
      socket.leave(`chat:${appointmentId}`);
    });

    // Send a message in real-time
    socket.on('chat:message', async (data: {
      appointmentId: string;
      senderId: string;
      receiverId: string;
      content: string;
      type?: string;
    }) => {
      // Persist to DB
      const msg = await sendMessage(
        data.senderId,
        data.receiverId,
        data.appointmentId,
        data.content,
        data.type || 'text'
      );

      // Broadcast to all in the room
      io.to(`chat:${data.appointmentId}`).emit('chat:message', {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        appointment_id: msg.appointment_id,
        content: msg.content,
        type: msg.type,
        created_at: msg.created_at,
      });
    });

    // WebRTC signaling
    socket.on('call:offer', (data: { appointmentId: string; offer: any; callerId: string }) => {
      socket.to(`chat:${data.appointmentId}`).emit('call:offer', {
        offer: data.offer,
        callerId: data.callerId,
      });
    });

    socket.on('call:answer', (data: { appointmentId: string; answer: any }) => {
      socket.to(`chat:${data.appointmentId}`).emit('call:answer', data.answer);
    });

    socket.on('call:ice-candidate', (data: { appointmentId: string; candidate: any }) => {
      socket.to(`chat:${data.appointmentId}`).emit('call:ice-candidate', data.candidate);
    });

    socket.on('call:end', (data: { appointmentId: string }) => {
      socket.to(`chat:${data.appointmentId}`).emit('call:end');
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[WS] Socket.io server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
