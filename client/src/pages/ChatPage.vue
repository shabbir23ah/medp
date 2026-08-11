<template>
  <AppLayout title="Chat">
    <div class="chat-box">
      <div v-for="m in messages" :key="m.id" :class="['msg', m.sender_id === userId ? 'me' : 'them']">
        <div class="bubble">{{ m.content }}</div>
        <div class="time">{{ new Date(m.created_at).toLocaleTimeString() }}</div>
      </div>
      <div v-if="messages.length === 0" class="center">No messages yet</div>
    </div>
    <div class="input-row">
      <input v-model="text" @keyup.enter="send" placeholder="Type a message..." class="chat-input" />
      <button @click="send" class="send-btn">Send</button>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const api = useApi();
const auth = useAuthStore();
const messages = ref<any[]>([]);
const text = ref('');
const userId = auth.user?.id;

async function loadMessages() {
  try {
    const { data } = await api.get(`/chat/${route.params.appointmentId}`);
    if (data.ok) messages.value = data.data;
  } catch {}
}

onMounted(loadMessages);

async function send() {
  if (!text.value.trim()) return;
  const msg = text.value;
  text.value = '';
  
  try {
    const { data } = await api.post(`/chat/${route.params.appointmentId}`, {
      receiverId: '', // Will be determined server-side from appointment
      content: msg,
    });
    if (data.ok) {
      messages.value.push({ ...data.data, sender_id: userId });
    }
  } catch (e) {
    // Fallback: show locally
    messages.value.push({ id: Date.now().toString(), sender_id: userId, content: msg, created_at: new Date().toISOString() });
  }
}
</script>

<style scoped>
.chat-box {
  flex: 1; overflow-y: auto; padding: 12px 0;
  display: flex; flex-direction: column; gap: 8px;
  min-height: calc(100vh - 200px); max-height: calc(100vh - 200px);
}
.msg { max-width: 80%; }
.msg.me { align-self: flex-end; }
.msg.them { align-self: flex-start; }
.bubble {
  padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.4;
}
.me .bubble { background: var(--color-primary); color: white; border-bottom-right-radius: 4px; }
.them .bubble { background: var(--color-border); color: var(--color-text); border-bottom-left-radius: 4px; }
.time { font-size: 10px; color: var(--color-text-muted); margin-top: 2px; padding: 0 4px; }
.center { text-align: center; padding: 40px; color: var(--color-text-muted); }
.input-row {
  display: flex; gap: 8px; padding: 12px 0;
  position: sticky; bottom: 0; background: var(--color-bg);
}
.chat-input {
  flex: 1; padding: 12px; border: 2px solid var(--color-border);
  border-radius: 10px; font-size: 14px; outline: none;
}
.chat-input:focus { border-color: var(--color-primary); }
.send-btn {
  padding: 12px 20px; background: var(--color-primary); color: white;
  border: none; border-radius: 10px; font-weight: 600;
}
</style>
