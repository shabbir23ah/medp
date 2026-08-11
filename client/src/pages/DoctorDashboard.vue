<template>
  <AppLayout>
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-num">{{ appointments.length }}</span>
        <span class="stat-label">Total Appointments</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ pendingCount }}</span>
        <span class="stat-label">Pending</span>
      </div>
    </div>

    <h3 class="section-title">Today's Schedule</h3>
    <div v-if="appointments.length === 0" class="state">
      <p>No appointments scheduled</p>
    </div>
    <div v-for="a in appointments" :key="a.id" class="apt-card">
      <div class="apt-header">
        <span class="apt-badge" :class="a.status">{{ a.status }}</span>
        <span class="apt-date">{{ formatTime(a.scheduled_at) }}</span>
      </div>
      <div class="apt-person">
        <div class="person-avatar">{{ (a.other_name || '?')[0] }}</div>
        <strong>{{ a.other_name }}</strong>
      </div>
      <div class="apt-actions" v-if="a.status === 'pending'">
        <button @click="update(a.id, 'confirmed')" class="btn-accept">Confirm</button>
        <button @click="update(a.id, 'cancelled')" class="btn-decline">Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">
        Open Chat →
      </router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const appointments = ref<any[]>([]);

const pendingCount = computed(() => appointments.value.filter(a => a.status === 'pending').length);

onMounted(async () => {
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
});

async function update(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.stat-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 20px; text-align: center;
}
.stat-num { display: block; font-size: 32px; font-weight: 800; color: var(--color-primary); }
.stat-label { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.state { text-align: center; padding: 32px; color: var(--color-text-muted); }
.apt-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 8px;
}
.apt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.apt-badge {
  display: inline-block; padding: 4px 12px; border-radius: 8px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
}
.apt-badge.pending { background: var(--color-warning-bg); color: var(--color-warning); }
.apt-badge.confirmed { background: var(--color-success-bg); color: var(--color-success); }
.apt-badge.cancelled { background: var(--color-danger-bg); color: var(--color-danger); }
.apt-badge.completed { background: var(--color-primary-bg); color: var(--color-primary); }
.apt-date { font-size: 13px; color: var(--color-text-muted); }
.apt-person { display: flex; align-items: center; gap: 10px; }
.person-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--color-primary-bg); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
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
