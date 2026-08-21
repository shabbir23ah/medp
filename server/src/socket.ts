import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { sendMessage } from './services/chat.js';

let io: Server;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SocketAuth {
  userId: string;
  role: string;
}

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

function getAuth(socket: Socket): SocketAuth | null {
  return (socket.data.auth as SocketAuth | undefined) ?? null;
}

async function isAppointmentMember(appointmentId: string, userId: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM appointments
     WHERE id = $1 AND (patient_id = $2 OR doctor_id = $2)`,
    [appointmentId, userId]
  );
  return (r.rowCount ?? 0) > 0;
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',').map(o => o.trim()),
      methods: ['GET', 'POST'],
    },
  });

  // Require a valid JWT before any socket event is handled
  io.use((socket, next) => {
    const token =
      (typeof socket.handshake.auth?.token === 'string' && socket.handshake.auth.token) ||
      (typeof socket.handshake.headers?.authorization === 'string' &&
        socket.handshake.headers.authorization.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : null);

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as { userId: string; role: string };
      if (!payload.userId || !UUID_RE.test(payload.userId)) {
        return next(new Error('Unauthorized'));
      }
      socket.data.auth = { userId: payload.userId, role: payload.role || 'patient' } satisfies SocketAuth;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const auth = getAuth(socket)!;
    // Auto-join personal room — no client-supplied userId needed
    socket.join(`user:${auth.userId}`);
    console.log(`[WS] Client connected: ${socket.id} user:${auth.userId}`);

    // Join a chat room for a specific appointment (membership required)
    socket.on('chat:join', safeHandler(async (appointmentId: string) => {
      if (typeof appointmentId !== 'string' || !UUID_RE.test(appointmentId)) return;
      if (!(await isAppointmentMember(appointmentId, auth.userId))) return;
      socket.join(`chat:${appointmentId}`);
      console.log(`[WS] ${socket.id} joined chat:${appointmentId}`);
    }));

    socket.on('chat:leave', safeHandler((appointmentId: string) => {
      if (typeof appointmentId === 'string') {
        socket.leave(`chat:${appointmentId}`);
      }
    }));

    // Send a message — senderId always taken from JWT, never client payload
    socket.on('chat:message', safeHandler(async (data: {
      appointmentId: string;
      receiverId: string;
      content: string;
      type?: string;
      clientId?: string;
    }) => {
      if (
        !data || !UUID_RE.test(String(data.appointmentId)) ||
        !UUID_RE.test(String(data.receiverId)) ||
        typeof data.content !== 'string' || !data.content.trim() ||
        data.content.length > 5000
      ) {
        return;
      }

      if (!(await isAppointmentMember(data.appointmentId, auth.userId))) return;

      const msg = await sendMessage(
        auth.userId,
        data.receiverId,
        data.appointmentId,
        data.content,
        data.type === 'prescription' ? 'prescription' : 'text'
      );

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

    socket.on('chat:typing', safeHandler(async (data: { appointmentId: string }) => {
      if (!data || !UUID_RE.test(String(data.appointmentId))) return;
      if (!(await isAppointmentMember(data.appointmentId, auth.userId))) return;
      socket.to(`chat:${data.appointmentId}`).emit('chat:typing');
    }));

    // WebRTC signaling — callerId always from JWT
    socket.on('call:offer', safeHandler((data: {
      appointmentId: string;
      offer: any;
      receiverId: string;
    }) => {
      if (!data || !UUID_RE.test(String(data.receiverId)) || !UUID_RE.test(String(data.appointmentId))) return;
      io.to(`user:${data.receiverId}`).emit('call:offer', {
        offer: data.offer,
        callerId: auth.userId,
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

  console.log('[WS] Socket.io server initialized (JWT required)');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
