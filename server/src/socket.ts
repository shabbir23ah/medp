import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { sendMessage } from './services/chat.js';

let io: Server;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A malformed payload from any client must never take down the process
function safeHandler(fn: (data: any) => void | Promise<void>) {
  return async (data: any) => {
    try {
      await fn(data);
    } catch (err) {
      console.error('[WS] handler error:', err instanceof Error ? err.message : err);
    }
  };
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Personal room — lets us reach a user anywhere in the app
    // (required for global incoming-call banners)
    socket.on('auth:identify', safeHandler((userId: string) => {
      if (typeof userId === 'string' && UUID_RE.test(userId)) {
        socket.join(`user:${userId}`);
      }
    }));

    // Join a chat room for a specific appointment
    socket.on('chat:join', safeHandler((appointmentId: string) => {
      if (typeof appointmentId === 'string' && UUID_RE.test(appointmentId)) {
        socket.join(`chat:${appointmentId}`);
        console.log(`[WS] ${socket.id} joined chat:${appointmentId}`);
      }
    }));

    socket.on('chat:leave', safeHandler((appointmentId: string) => {
      if (typeof appointmentId === 'string') {
        socket.leave(`chat:${appointmentId}`);
      }
    }));

    // Send a message in real-time
    socket.on('chat:message', safeHandler(async (data: {
      appointmentId: string;
      senderId: string;
      receiverId: string;
      content: string;
      type?: string;
      clientId?: string;
    }) => {
      if (
        !data || !UUID_RE.test(String(data.appointmentId)) ||
        !UUID_RE.test(String(data.senderId)) || !UUID_RE.test(String(data.receiverId)) ||
        typeof data.content !== 'string' || !data.content.trim() ||
        data.content.length > 5000
      ) {
        return;
      }

      // Persist to DB
      const msg = await sendMessage(
        data.senderId,
        data.receiverId,
        data.appointmentId,
        data.content,
        data.type === 'prescription' ? 'prescription' : 'text'
      );

      // Broadcast to all in the room (sender included — used to confirm
      // optimistic sends via clientId)
      io.to(`chat:${data.appointmentId}`).emit('chat:message', {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        appointment_id: msg.appointment_id,
        content: msg.content,
        type: msg.type,
        created_at: msg.created_at,
        clientId: typeof data.clientId === 'string' ? data.clientId.slice(0, 64) : undefined,
      });
    }));

    // Typing indicator — relay to everyone else in the conversation
    socket.on('chat:typing', safeHandler((data: { appointmentId: string }) => {
      if (data && UUID_RE.test(String(data.appointmentId))) {
        socket.to(`chat:${data.appointmentId}`).emit('chat:typing');
      }
    }));

    // WebRTC signaling — unicast via personal rooms so calls work
    // regardless of which screen each peer is on
    socket.on('call:offer', safeHandler((data: {
      appointmentId: string;
      offer: any;
      callerId: string;
      receiverId: string;
    }) => {
      if (!data || !UUID_RE.test(String(data.receiverId))) return;
      io.to(`user:${data.receiverId}`).emit('call:offer', {
        offer: data.offer,
        callerId: data.callerId,
        appointmentId: data.appointmentId,
      });
    }));

    socket.on('call:answer', safeHandler((data: { appointmentId: string; answer: any; targetUserId: string }) => {
      if (!data || !UUID_RE.test(String(data.targetUserId))) return;
      io.to(`user:${data.targetUserId}`).emit('call:answer', data.answer);
    }));

    socket.on('call:ice-candidate', safeHandler((data: { candidate: any; targetUserId: string }) => {
      if (!data || !UUID_RE.test(String(data.targetUserId))) return;
      io.to(`user:${data.targetUserId}`).emit('call:ice-candidate', data.candidate);
    }));

    socket.on('call:end', safeHandler((data: { targetUserId: string }) => {
      if (!data || !UUID_RE.test(String(data.targetUserId))) return;
      io.to(`user:${data.targetUserId}`).emit('call:end');
    }));

    socket.on('call:decline', safeHandler((data: { targetUserId: string; appointmentId: string }) => {
      if (!data || !UUID_RE.test(String(data.targetUserId))) return;
      io.to(`user:${data.targetUserId}`).emit('call:decline', { appointmentId: data.appointmentId });
    }));

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
