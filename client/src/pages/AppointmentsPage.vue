<template>
  <AppLayout>
    <div class="page-header">
      <h1>Appointments</h1>
    </div>

    <div v-if="loading" class="state"><div class="spinner"></div></div>

    <div v-else-if="appointments.length === 0" class="state">
      <div class="empty-icon">📅</div>
      <h2>No appointments</h2>
      <p v-if="!auth.isDoctor">Book an appointment with a doctor to get started.</p>
      <router-link v-if="!auth.isDoctor" to="/doctors" class="cta-btn">Find a Doctor</router-link>
    </div>

    <div v-for="a in appointments" :key="a.id" class="apt-card">
      <div class="apt-header">
        <span class="apt-badge" :class="a.status">{{ a.status }}</span>
        <span class="apt-date">{{ formatDate(a.scheduled_at) }}</span>
      </div>
      <div class="apt-body">
        <div class="apt-person">
          <div class="person-avatar">{{ (a.other_name || '?')[0].toUpperCase() }}</div>
          <strong>{{ a.other_name }}</strong>
        </div>
        <div class="apt-time">{{ formatTime(a.scheduled_at) }}</div>
      </div>
      <div v-if="a.notes" class="apt-notes">{{ a.notes }}</div>
      <div class="apt-actions" v-if="a.status === 'pending'">
        <button @click="update(a.id, 'confirmed')" class="btn-accept">✓ Confirm</button>
        <button @click="update(a.id, 'cancelled')" class="btn-decline">✕ Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">
        💬 Open Chat
      </router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const api = useApi();
const auth = useAuthStore();
const appointments = ref<any[]>([]);
const loading = ref(true);

async function fetch() {
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
}

onMounted(async () => {
  await fetch();
  loading.value = false;
});

async function update(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  await fetch();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; }
.state { text-align: center; padding: 60px 20px; }
.state h2 { font-size: 18px; margin: 8px 0 4px; }
.state p { font-size: 14px; color: var(--color-text-muted); margin-bottom: 16px; }
.empty-icon { font-size: 40px; }
.spinner {
  width: 28px; height: 28px; border: 3px solid var(--color-border);
  border-top-color: var(--color-primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.cta-btn {
  display: inline-block; padding: 12px 24px;
  background: var(--color-primary); color: white;
  border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none;
}
.apt-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 10px;
}
.apt-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.apt-badge {
  display: inline-block; padding: 4px 12px; border-radius: 8px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
}
.apt-badge.pending { background: var(--color-warning-bg); color: var(--color-warning); }
.apt-badge.confirmed { background: var(--color-success-bg); color: var(--color-success); }
.apt-badge.cancelled { background: var(--color-danger-bg); color: var(--color-danger); }
.apt-badge.completed { background: var(--color-primary-bg); color: var(--color-primary); }
.apt-date { font-size: 13px; color: var(--color-text-muted); }
.apt-body { display: flex; justify-content: space-between; align-items: center; }
.apt-person { display: flex; align-items: center; gap: 10px; }
.person-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--color-primary-bg); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
.apt-time { font-size: 14px; font-weight: 600; color: var(--color-text-secondary); }
.apt-notes { font-size: 13px; color: var(--color-text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border); }
.apt-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-accept, .btn-decline {
  flex: 1; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600;
}
.btn-accept { background: var(--color-success-bg); color: var(--color-success); border: 1px solid rgba(16,185,129,0.2); }
.btn-decline { background: var(--color-danger-bg); color: var(--color-danger); border: 1px solid rgba(239,68,68,0.2); }
.btn-chat {
  display: block; margin-top: 12px; text-align: center; padding: 12px;
  background: var(--color-primary); color: white; border-radius: 10px;
  text-decoration: none; font-weight: 600; font-size: 14px;
}
</style>
