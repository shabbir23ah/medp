<template>
  <AppLayout>
    <h1 class="page-title">Appointments</h1>
    <div v-if="loading" class="state"><div class="spinner"></div></div>
    <div v-else-if="appts.length === 0" class="state">
      <div class="empty-icon">📅</div>
      <h2>No appointments</h2>
      <p v-if="!auth.isDoctor">Book an appointment with a doctor.</p>
      <router-link v-if="!auth.isDoctor" to="/doctors" class="cta-btn">Find a Doctor</router-link>
    </div>
    <div v-for="a in appts" :key="a.id" class="card">
      <div class="card-top">
        <span class="badge" :class="a.status">{{ a.status }}</span>
        <span class="date">{{ fmtDate(a.scheduled_at) }}</span>
      </div>
      <div class="person-row">
        <div class="person-avatar">{{ (a.other_name || '?')[0] }}</div>
        <strong>{{ a.other_name }}</strong>
        <span class="time">{{ fmtTime(a.scheduled_at) }}</span>
      </div>
      <div v-if="a.notes" class="notes">{{ a.notes }}</div>
      <div class="actions" v-if="a.status === 'pending'">
        <button @click="update(a.id, 'confirmed')" class="btn-accept">✓ Confirm</button>
        <button @click="update(a.id, 'cancelled')" class="btn-decline">✕ Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">💬 Open Chat</router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';
const api = useApi(); const auth = useAuthStore();
const appts = ref<any[]>([]); const loading = ref(true);
async function fetch() { const { data } = await api.get('/appointments'); if (data.ok) appts.value = data.data; }
onMounted(async () => { await fetch(); loading.value = false; });
async function update(id: string, status: string) { await api.put(`/appointments/${id}`, { status }); await fetch(); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 800; margin-bottom: 20px; }
.state { text-align: center; padding: 60px 20px; }
.state h2 { font-size: 18px; margin: 8px 0 4px; }
.state p { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.empty-icon { font-size: 40px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.cta-btn { display: inline-block; padding: 14px 28px; background: var(--primary); color: var(--primary-text); border-radius: 14px; font-weight: 700; font-size: 15px; text-decoration: none; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 10px; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.cancelled { background: var(--danger-bg); color: var(--danger); }
.badge.completed { background: var(--primary-bg); color: var(--primary); }
.date { font-size: 13px; color: var(--text-muted); }
.person-row { display: flex; align-items: center; gap: 10px; }
.person-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.time { margin-left: auto; font-size: 14px; font-weight: 600; color: var(--text-secondary); }
.notes { font-size: 13px; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-accept, .btn-decline { flex: 1; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; }
.btn-accept { background: var(--success-bg); color: var(--success); }
.btn-decline { background: var(--danger-bg); color: var(--danger); }
.btn-chat { display: block; margin-top: 12px; text-align: center; padding: 12px; background: var(--primary); color: var(--primary-text); border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; }
</style>
