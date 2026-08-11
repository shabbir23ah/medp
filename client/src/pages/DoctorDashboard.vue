<template>
  <AppLayout :title="$t('nav.dashboard')">
    <div class="stats-grid">
      <div class="stat-box"><strong>{{ appointments.length }}</strong><span>Appointments</span></div>
      <div class="stat-box"><strong>0</strong><span>Today</span></div>
    </div>

    <h3>Upcoming Appointments</h3>
    <div v-if="appointments.length === 0" class="center">No appointments</div>
    <div v-for="a in appointments" :key="a.id" class="apt-card">
      <span class="status" :class="a.status">{{ a.status }}</span>
      <strong>{{ a.other_name }}</strong>
      <div class="date">{{ new Date(a.scheduled_at).toLocaleString() }}</div>
      <div class="actions" v-if="a.status === 'pending'">
        <button @click="updateStatus(a.id, 'confirmed')" class="btn-confirm">Confirm</button>
        <button @click="updateStatus(a.id, 'cancelled')" class="btn-cancel">Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">Chat</router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const appointments = ref<any[]>([]);

onMounted(async () => {
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
});

async function updateStatus(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
}
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.stat-box {
  background: var(--color-surface); border-radius: 12px; padding: 20px;
  text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-box strong { display: block; font-size: 28px; color: var(--color-primary); }
.stat-box span { font-size: 12px; color: var(--color-text-muted); }
h3 { margin-bottom: 12px; }
.center { text-align: center; padding: 20px; color: var(--color-text-muted); }
.apt-card {
  background: var(--color-surface); border-radius: 12px; padding: 14px;
  margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.status {
  display: inline-block; padding: 2px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600; margin-bottom: 6px;
}
.status.pending { background: #fef3c7; color: #92400e; }
.status.confirmed { background: #d1fae5; color: #065f46; }
.status.cancelled { background: #fee2e2; color: #991b1b; }
.date { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
.actions { display: flex; gap: 8px; margin-top: 10px; }
.btn-confirm { padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-danger); color: var(--color-danger); border-radius: 6px; font-size: 13px; cursor: pointer; }
.btn-chat { display: block; margin-top: 10px; text-align: center; padding: 10px; background: var(--color-primary); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
</style>
