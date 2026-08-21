import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';

// App-wide singleton — one connection shared by chat, calls, and the
// global incoming-call listener. Never disconnected on page unmount.
let socket: Socket | null = null;
let connectedToken = '';

/** Returns an authenticated socket. JWT is required by the server. */
export function getSocket(_userId?: string): Socket {
  const auth = useAuthStore();
  const token = auth.token || '';

  // Recreate connection if token changed (login/logout) or missing
  if (socket && connectedToken !== token) {
    socket.disconnect();
    socket = null;
    connectedToken = '';
  }

  if (!socket) {
    socket = io(window.location.origin, {
      auth: { token },
      autoConnect: !!token,
    });
    connectedToken = token;
  } else if (!socket.connected && token) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}
