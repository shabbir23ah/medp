import { io, Socket } from 'socket.io-client';

// App-wide singleton — one connection shared by chat, calls, and the
// global incoming-call listener. Never disconnected on page unmount.
let socket: Socket | null = null;
let identifiedUserId = '';

export function getSocket(userId?: string): Socket {
  if (!socket) {
    socket = io(window.location.origin);
  }
  if (userId && userId !== identifiedUserId) {
    identifiedUserId = userId;
    socket.emit('auth:identify', userId);
  }
  return socket;
}
