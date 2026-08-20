<template>
  <AppLayout title="Chat">
    <!-- Call banner -->
    <div v-if="inCall || incomingCall" class="call-banner" :class="{ ringing: incomingCall }">
      <span>{{ incomingCall ? 'Incoming call...' : 'Call in progress' }}</span>
      <div class="call-actions">
        <button v-if="incomingCall" @click="acceptCall" class="btn-accept">Accept</button>
        <button @click="endCall" class="btn-end">End</button>
      </div>
    </div>

    <!-- Video -->
    <div v-if="inCall" class="video-container">
      <video ref="remoteVideo" autoplay playsinline class="remote-video"></video>
      <video ref="localVideo" autoplay playsinline muted class="local-video"></video>
      <div class="call-controls">
        <button @click="toggleVideo" class="ctrl-btn"><Video :size="16" :stroke-width="2" :class="{ off: !videoOn }" /></button>
        <button @click="toggleAudio" class="ctrl-btn"><Mic :size="16" :stroke-width="2" :class="{ off: !audioOn }" /></button>
        <button @click="endCall" class="ctrl-btn end"><PhoneOff :size="16" :stroke-width="2" /></button>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-box" ref="chatBox">
      <div v-for="m in messages" :key="m.id" :class="['msg', m.sender_id === userId ? 'me' : 'them']">
        <div v-if="m.type === 'call_started'" class="call-msg"><Phone :size="12" :stroke-width="2" /> Call started</div>
        <div v-else-if="m.type === 'call_ended'" class="call-msg"><PhoneOff :size="12" :stroke-width="2" /> Call ended</div>
        <div v-else-if="m.type === 'prescription'" class="rx-msg">
          <Pill :size="14" :stroke-width="2" /> <strong>Prescription shared</strong>
          <p>{{ m.content }}</p>
        </div>
        <div v-else class="bubble">{{ m.content }}</div>
        <div class="time" v-if="m.type === 'text'">{{ formatTime(m.created_at) }}</div>
      </div>
      <div v-if="messages.length === 0" class="center">No messages yet</div>
    </div>

    <div class="input-row">
      <button @click="startCall" class="call-btn" title="Start call"><Phone :size="16" :stroke-width="2" /></button>
      <input v-model="text" @keyup.enter="sendText" placeholder="Type a message..." class="chat-input" />
      <button @click="sendText" class="send-btn">Send</button>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, Video, Mic, Pill } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const api = useApi();
const auth = useAuthStore();

const appointmentId = route.params.appointmentId as string;
const userId = auth.user?.id || '';
const messages = ref<any[]>([]);
const text = ref('');
const chatBox = ref<HTMLElement>();

let socket: Socket;
let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;

const inCall = ref(false);
const incomingCall = ref(false);
const videoOn = ref(true);
const audioOn = ref(true);
const localVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
  });
}

// Load history
async function loadHistory() {
  try {
    const { data } = await api.get(`/chat/${appointmentId}`);
    if (data.ok) messages.value = data.data;
    scrollBottom();
  } catch {}
}

// Connect socket
function connectSocket() {
  socket = io(window.location.origin);

  socket.emit('chat:join', appointmentId);

  socket.on('chat:message', (msg: any) => {
    messages.value.push(msg);
    scrollBottom();
  });

  // WebRTC signaling
  socket.on('call:offer', async (data: { offer: RTCSessionDescriptionInit; callerId: string }) => {
    incomingCall.value = true;
    // Store offer for accept
    (window as any).__pendingOffer = data.offer;
  });

  socket.on('call:answer', async (answer: RTCSessionDescriptionInit) => {
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('call:ice-candidate', async (candidate: RTCIceCandidateInit) => {
    if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on('call:end', () => {
    hangup();
  });
}

// WebRTC
async function getMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  if (localVideo.value) localVideo.value.srcObject = localStream;
}

async function createPeerConnection() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('call:ice-candidate', { appointmentId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e) => {
    if (remoteVideo.value && e.streams[0]) {
      remoteVideo.value.srcObject = e.streams[0];
    }
  };

  if (localStream) {
    localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));
  }
}

async function startCall() {
  try {
    await getMedia();
    await createPeerConnection();

    const offer = await pc!.createOffer();
    await pc!.setLocalDescription(offer);

    socket.emit('call:offer', { appointmentId, offer, callerId: userId });
    inCall.value = true;

    messages.value.push({
      id: Date.now().toString(),
      sender_id: userId,
      type: 'call_started',
      content: 'Call started',
      created_at: new Date().toISOString(),
    });
    scrollBottom();
  } catch (e) {
    console.error('Call start failed:', e);
    alert('Could not start call. Check camera/microphone permissions.');
  }
}

async function acceptCall() {
  incomingCall.value = false;
  try {
    await getMedia();
    await createPeerConnection();

    const offer = (window as any).__pendingOffer;
    if (offer && pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { appointmentId, answer });
    }
    inCall.value = true;
  } catch (e) {
    console.error('Accept call failed:', e);
  }
}

function endCall() {
  socket.emit('call:end', { appointmentId });
  hangup();
}

function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  inCall.value = false;
  incomingCall.value = false;
  if (localVideo.value) localVideo.value.srcObject = null;
  if (remoteVideo.value) remoteVideo.value.srcObject = null;

  messages.value.push({
    id: Date.now().toString(),
    sender_id: userId,
    type: 'call_ended',
    content: 'Call ended',
    created_at: new Date().toISOString(),
  });
  scrollBottom();
}

function toggleVideo() {
  videoOn.value = !videoOn.value;
  if (localStream) {
    localStream.getVideoTracks().forEach((t) => (t.enabled = videoOn.value));
  }
}

function toggleAudio() {
  audioOn.value = !audioOn.value;
  if (localStream) {
    localStream.getAudioTracks().forEach((t) => (t.enabled = audioOn.value));
  }
}

async function sendText() {
  if (!text.value.trim()) return;
  const content = text.value;
  text.value = '';

  // Get receiverId from appointment
  let receiverId = '';
  try {
    const { data } = await api.get('/appointments');
    if (data.ok) {
      const apt = data.data.find((a: any) => a.id === appointmentId);
      if (apt) {
        receiverId = auth.isDoctor ? apt.patient_id : apt.doctor_id;
      }
    }
  } catch {}

  socket.emit('chat:message', {
    appointmentId,
    senderId: userId,
    receiverId,
    content,
    type: 'text',
  });
}

onMounted(async () => {
  await loadHistory();
  connectSocket();
});

onUnmounted(() => {
  if (socket) {
    socket.emit('chat:leave', appointmentId);
    socket.disconnect();
  }
  hangup();
});
</script>

<style scoped>
.chat-box {
  flex: 1; overflow-y: auto; padding: 12px 0;
  display: flex; flex-direction: column; gap: 8px;
  min-height: calc(100vh - 250px); max-height: calc(100vh - 250px);
}
.msg { max-width: 80%; }
.msg.me { align-self: flex-end; }
.msg.them { align-self: flex-start; }
.bubble {
  padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.4;
}
.me .bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
.them .bubble { background: var(--border); color: var(--text); border-bottom-left-radius: 4px; }
.time { font-size: 10px; color: var(--text-muted); margin-top: 2px; padding: 0 4px; }
.call-msg { text-align: center; font-size: 12px; color: var(--text-muted); padding: 8px; }
.rx-msg { background: #fef3c7; padding: 12px; border-radius: 10px; margin: 8px 0; }
.rx-msg p { margin-top: 4px; font-size: 13px; }
.center { text-align: center; padding: 40px; color: var(--text-muted); }
.input-row {
  display: flex; gap: 8px; padding: 12px 0; align-items: center;
  position: sticky; bottom: 0; background: var(--bg);
}
.chat-input {
  flex: 1; padding: 10px; border: 2px solid var(--border);
  border-radius: 10px; font-size: 14px; outline: none;
}
.chat-input:focus { border-color: var(--primary); }
.send-btn, .call-btn {
  padding: 10px 16px; background: var(--primary); color: white;
  border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
}
.call-btn { font-size: 18px; padding: 10px 14px; }
.call-banner {
  background: #1e293b; color: white; padding: 12px 16px;
  border-radius: 10px; display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.call-banner.ringing { animation: pulse 1s infinite; background: #0f766e; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
.call-actions { display: flex; gap: 8px; }
.btn-accept { padding: 6px 14px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-end { padding: 6px 14px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; }
.video-container { position: relative; margin-bottom: 8px; }
.remote-video { width: 100%; border-radius: 10px; background: #000; }
.local-video { position: absolute; bottom: 8px; right: 8px; width: 100px; border-radius: 8px; border: 2px solid white; }
.call-controls { display: flex; gap: 8px; justify-content: center; padding: 8px; }
.ctrl-btn { width: 44px; height: 44px; border-radius: 50%; background: #334155; color: white; border: none; font-size: 16px; cursor: pointer; }
.ctrl-btn.end { background: #ef4444; }
.ctrl-btn svg.off { opacity: 0.4; }
</style>
