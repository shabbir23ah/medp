<template>
  <AppLayout title="Chat">
    <!-- Video -->
    <div v-if="call.inCall.value" class="video-container">
      <video :ref="call.setRemoteVideoEl" autoplay playsinline class="remote-video"></video>
      <video :ref="call.setLocalVideoEl" autoplay playsinline muted class="local-video"></video>
      <div class="call-controls">
        <button @click="call.toggleVideo()" class="ctrl-btn" aria-label="Toggle video">
          <Video :size="16" :stroke-width="2" :class="{ off: !call.videoOn.value }" />
        </button>
        <button @click="call.toggleAudio()" class="ctrl-btn" aria-label="Toggle audio">
          <Mic :size="16" :stroke-width="2" :class="{ off: !call.audioOn.value }" />
        </button>
        <button @click="call.endCall()" class="ctrl-btn end" aria-label="End call">
          <PhoneOff :size="16" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-box" ref="chatBox">
      <div v-for="m in messages" :key="m.id" :class="['msg', m.sender_id === userId ? 'me' : 'them']">
        <div v-if="m.type === 'prescription'" class="rx-msg">
          <Pill :size="14" :stroke-width="2" /> <strong>Prescription shared</strong>
          <p>{{ m.content }}</p>
        </div>
        <div v-else class="bubble">{{ m.content }}</div>
        <div class="time" v-if="m.type === 'text'">
          {{ formatTime(m.created_at) }}
          <span
            v-if="m.sender_id === userId"
            class="status"
            :class="{ pending: m.status === 'pending' }"
            :aria-label="m.status === 'pending' ? 'Sending' : 'Sent'"
          >{{ m.status === 'pending' ? '⏳' : '✓' }}</span>
        </div>
      </div>
      <div v-if="messages.length === 0" class="center">No messages yet</div>
    </div>

    <!-- Typing indicator -->
    <div v-if="peerTyping" class="typing" aria-live="polite">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span> typing…
    </div>

    <div class="input-row">
      <button @click="startCall" class="call-btn" aria-label="Start video call"><Phone :size="16" :stroke-width="2" /></button>
      <input
        v-model="text"
        @keyup.enter="sendText"
        @input="onTypingInput"
        placeholder="Type a message..."
        class="chat-input"
      />
      <button @click="sendText" class="send-btn">Send</button>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Phone, PhoneOff, Video, Mic, Pill } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import { getSocket } from '../composables/useSocket';
import { useCall } from '../composables/useCall';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const api = useApi();
const auth = useAuthStore();
const call = useCall();

const appointmentId = route.params.appointmentId as string;
const userId = auth.user?.id || '';
const messages = ref<any[]>([]);
const text = ref('');
const chatBox = ref<HTMLElement>();
const peerTyping = ref(false);

let receiverId = '';
let peerTypingTimer: ReturnType<typeof setTimeout> | null = null;
let lastTypingSent = 0;

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

// Resolve the other participant once per session (was previously
// re-fetched on every single message send)
async function resolveReceiver() {
  if (receiverId) return;
  try {
    const { data } = await api.get('/appointments');
    if (data.ok) {
      const apt = data.data.find((a: any) => a.id === appointmentId);
      if (apt) receiverId = auth.isDoctor ? apt.patient_id : apt.doctor_id;
    }
  } catch {}
}

// Reconcile server echo with the optimistic message via clientId
function onMessage(msg: any) {
  if (msg.clientId) {
    const idx = messages.value.findIndex((m) => m.id === msg.clientId);
    if (idx !== -1) {
      messages.value[idx] = { ...msg, status: 'sent' };
      scrollBottom();
      return;
    }
  }
  if (msg.sender_id === userId) {
    // Own echo without matching clientId — reconcile by content
    const idx = messages.value.findIndex(
      (m) => m.status === 'pending' && m.content === msg.content
    );
    if (idx !== -1) {
      messages.value[idx] = { ...msg, status: 'sent' };
    }
  } else {
    messages.value.push({ ...msg, status: 'received' });
    peerTyping.value = false;
  }
  scrollBottom();
}

function onPeerTyping() {
  peerTyping.value = true;
  if (peerTypingTimer) clearTimeout(peerTypingTimer);
  peerTypingTimer = setTimeout(() => (peerTyping.value = false), 3000);
}

// Throttled typing broadcast — at most one event every 2s while typing
function onTypingInput() {
  const now = Date.now();
  if (text.value.trim() && now - lastTypingSent > 2000) {
    lastTypingSent = now;
    getSocket(userId).emit('chat:typing', { appointmentId });
  }
}

// Optimistic send — message appears instantly as ⏳, flips to ✓ on echo
async function sendText() {
  const content = text.value.trim();
  if (!content) return;
  text.value = '';

  await resolveReceiver();

  const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  messages.value.push({
    id: clientId,
    sender_id: userId,
    content,
    type: 'text',
    created_at: new Date().toISOString(),
    status: 'pending',
  });
  scrollBottom();

  getSocket(userId).emit('chat:message', {
    appointmentId,
    senderId: userId,
    receiverId,
    content,
    type: 'text',
    clientId,
  });
}

async function startCall() {
  await resolveReceiver();
  if (receiverId) {
    call.startCall(appointmentId, receiverId);
  }
}

onMounted(async () => {
  call.bindSignalListeners();
  await loadHistory();
  await resolveReceiver();

  const socket = getSocket(userId);
  socket.emit('chat:join', appointmentId);
  socket.on('chat:message', onMessage);
  socket.on('chat:typing', onPeerTyping);

  // Arrived via "Call Now" on the appointments page
  if (route.query.call === '1' && receiverId) {
    router.replace({ query: {} });
    call.startCall(appointmentId, receiverId);
  }
});

onUnmounted(() => {
  const socket = getSocket(userId);
  socket.emit('chat:leave', appointmentId);
  socket.off('chat:message', onMessage);
  socket.off('chat:typing', onPeerTyping);
  if (peerTypingTimer) clearTimeout(peerTypingTimer);
  // NOTE: shared socket stays connected and active calls are NOT hung up
  // here — calls continue across navigation (see CallBanner).
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
.me .bubble { background: var(--primary); color: var(--primary-text); border-bottom-right-radius: 4px; }
.them .bubble { background: var(--border); color: var(--text); border-bottom-left-radius: 4px; }
.time { font-size: 10px; color: var(--text-muted); margin-top: 2px; padding: 0 4px; }
.status { margin-left: 3px; }
.status.pending { opacity: 0.6; }
.rx-msg { background: var(--warning-bg); padding: 12px; border-radius: 10px; margin: 8px 0; color: var(--text); }
.rx-msg p { margin-top: 4px; font-size: 13px; }
.center { text-align: center; padding: 40px; color: var(--text-muted); }

.typing {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--text-muted); padding: 4px 6px;
}
.typing-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--text-muted);
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.input-row {
  display: flex; gap: 8px; padding: 12px 0; align-items: center;
  position: sticky; bottom: 0; background: var(--bg);
}
.chat-input {
  flex: 1; padding: 10px; border: 2px solid var(--border);
  border-radius: 10px; font-size: 14px; outline: none;
  background: var(--bg); color: var(--text);
}
.chat-input:focus { border-color: var(--primary); }
.send-btn, .call-btn {
  padding: 10px 16px; background: var(--primary); color: var(--primary-text);
  border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
}
.call-btn { font-size: 18px; padding: 10px 14px; }

.video-container { position: relative; margin-bottom: 8px; }
.remote-video { width: 100%; border-radius: 10px; background: #000; }
.local-video { position: absolute; bottom: 8px; right: 8px; width: 100px; border-radius: 8px; border: 2px solid white; }
.call-controls { display: flex; gap: 8px; justify-content: center; padding: 8px; }
.ctrl-btn { width: 44px; height: 44px; border-radius: 50%; background: #334155; color: white; border: none; font-size: 16px; cursor: pointer; }
.ctrl-btn.end { background: var(--danger); }
.ctrl-btn svg.off { opacity: 0.4; }
</style>
