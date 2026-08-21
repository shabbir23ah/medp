import { ref } from 'vue';
import { getSocket } from './useSocket';
import { useAuthStore } from '../stores/auth';
import { useToast } from './useToast';

// ── Module-level singleton state ─────────────────────────────────────
// All WebRTC/socket state lives here (not inside useCall()) so every
// component shares one connection, one peer connection, one truth.

const incoming = ref<{ appointmentId: string; callerId: string } | null>(null);
const inCall = ref(false);
const activeAppointmentId = ref('');
const videoOn = ref(true);
const audioOn = ref(true);

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let pendingOffer: RTCSessionDescriptionInit | null = null;
let peerUserId = '';
let remoteVideoEl: HTMLVideoElement | null = null;
let localVideoEl: HTMLVideoElement | null = null;
const bufferedCandidates: RTCIceCandidateInit[] = [];
let listenersBound = false;

function flushCandidates() {
  while (bufferedCandidates.length && pc) {
    const c = bufferedCandidates.shift()!;
    pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
  }
}

function attachLocalVideo() {
  if (localVideoEl && localStream) localVideoEl.srcObject = localStream;
}

function hangupInternal() {
  if (pc) { pc.close(); pc = null; }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  if (localVideoEl) localVideoEl.srcObject = null;
  if (remoteVideoEl) remoteVideoEl.srcObject = null;
  bufferedCandidates.length = 0;
  pendingOffer = null;
  peerUserId = '';
  inCall.value = false;
  incoming.value = null;
  activeAppointmentId.value = '';
}

export function useCall() {
  const auth = useAuthStore();
  const toast = useToast();

  function bindSignalListeners() {
    if (listenersBound) return;
    listenersBound = true;
    const socket = getSocket(auth.user?.id);

    socket.on('call:offer', (data: { offer: RTCSessionDescriptionInit; callerId: string; appointmentId: string }) => {
      // Busy — ignore additional offers
      if (inCall.value || incoming.value) return;
      pendingOffer = data.offer;
      incoming.value = { appointmentId: data.appointmentId, callerId: data.callerId };
    });

    socket.on('call:answer', async (answer: RTCSessionDescriptionInit) => {
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      flushCandidates();
    });

    socket.on('call:ice-candidate', (candidate: RTCIceCandidateInit) => {
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        bufferedCandidates.push(candidate); // arrived early — replay after remote description
      }
    });

    socket.on('call:end', () => {
      if (inCall.value) toast.info('Call ended');
      hangupInternal();
    });

    socket.on('call:decline', () => {
      if (inCall.value) toast.info('Call declined');
      hangupInternal();
    });
  }

  async function getMedia(): Promise<MediaStream> {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    attachLocalVideo();
    return localStream;
  }

  function createPeerConnection(targetUserId: string): RTCPeerConnection {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const socket = getSocket(auth.user?.id);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call:ice-candidate', { candidate: e.candidate, targetUserId });
      }
    };

    pc.ontrack = (e) => {
      if (e.streams[0] && remoteVideoEl) remoteVideoEl.srcObject = e.streams[0];
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));
    }
    return pc;
  }

  async function startCall(appointmentId: string, receiverId: string) {
    bindSignalListeners();
    try {
      await getMedia();
      createPeerConnection(receiverId);
      const socket = getSocket(auth.user?.id);

      const offer = await pc!.createOffer();
      await pc!.setLocalDescription(offer);
      socket.emit('call:offer', { appointmentId, offer, receiverId });

      peerUserId = receiverId;
      activeAppointmentId.value = appointmentId;
      inCall.value = true;
    } catch {
      hangupInternal();
      toast.error('Could not start call. Check camera/microphone permissions.');
    }
  }

  // Returns the appointmentId so the caller can navigate to ChatPage
  async function accept(): Promise<string | undefined> {
    if (!incoming.value || !pendingOffer) return;
    const { appointmentId, callerId } = incoming.value;
    incoming.value = null;
    bindSignalListeners();

    try {
      await getMedia();
      createPeerConnection(callerId);
      const socket = getSocket(auth.user?.id);

      await pc!.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      flushCandidates();

      const answer = await pc!.createAnswer();
      await pc!.setLocalDescription(answer);
      socket.emit('call:answer', { appointmentId, answer, targetUserId: callerId });

      peerUserId = callerId;
      activeAppointmentId.value = appointmentId;
      inCall.value = true;
      return appointmentId;
    } catch {
      hangupInternal();
      toast.error('Could not answer call. Check camera/microphone permissions.');
    }
  }

  function decline() {
    if (!incoming.value) return;
    getSocket(auth.user?.id).emit('call:decline', {
      targetUserId: incoming.value.callerId,
      appointmentId: incoming.value.appointmentId,
    });
    incoming.value = null;
    pendingOffer = null;
  }

  function endCall() {
    if (peerUserId) {
      getSocket(auth.user?.id).emit('call:end', { targetUserId: peerUserId });
    }
    hangupInternal();
  }

  function toggleVideo() {
    videoOn.value = !videoOn.value;
    localStream?.getVideoTracks().forEach((t) => (t.enabled = videoOn.value));
  }

  function toggleAudio() {
    audioOn.value = !audioOn.value;
    localStream?.getAudioTracks().forEach((t) => (t.enabled = audioOn.value));
  }

  // Template-ref setters — ChatPage binds its <video> elements to these.
  // Signature matches Vue's VNodeRef callback (Element | Component | null).
  function setLocalVideoEl(el: unknown) {
    localVideoEl = (el as HTMLVideoElement | null) ?? null;
    attachLocalVideo();
  }
  function setRemoteVideoEl(el: unknown) {
    remoteVideoEl = (el as HTMLVideoElement | null) ?? null;
  }

  return {
    incoming,
    inCall,
    activeAppointmentId,
    videoOn,
    audioOn,
    startCall,
    accept,
    decline,
    endCall,
    toggleVideo,
    toggleAudio,
    setLocalVideoEl,
    setRemoteVideoEl,
    bindSignalListeners,
  };
}
