<template>
  <AppLayout :title="$t('nav.appointments')">
    <div v-if="loading" class="center">{{ $t('common.loading') }}</div>
    <div v-else-if="appointments.length === 0" class="center">No appointments yet</div>
    <div v-for="a in appointments" :key="a.id" class="apt-card">
      <span class="status" :class="a.status">{{ a.status }}</span>
      <strong>{{ a.other_name }}</strong>
      <div class="date">{{ new Date(a.scheduled_at).toLocaleString() }}</div>
      <div class="notes" v-if="a.notes">{{ a.notes }}</div>
      <div class="actions" v-if="a.status === 'pending'">
        <button @click="updateStatus(a.id, 'confirmed')" class="btn-confirm">Confirm</button>
        <button @click="updateStatus(a.id, 'cancelled')" class="btn-cancel">Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">
        Open Chat
      </router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const appointments = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get('/appointments');
    if (data.ok) appointments.value = data.data;
  } finally { loading.value = false; }
});

async function updateStatus(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  const { data } = await api.get('/appointments');
  if (data.ok) appointments.value = data.data;
}
</script>

<style scoped>
.center { text-align: center; padding: 40px; color: var(--color-text-muted); }
.apt-card {
  background: var(--color-surface); border-radius: 12px; padding: 16px;
  margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.status {
  display: inline-block; padding: 2px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600; margin-bottom: 8px;
}
.status.pending { background: #fef3c7; color: #92400e; }
.status.confirmed { background: #d1fae5; color: #065f46; }
.status.cancelled { background: #fee2e2; color: #991b1b; }
.status.completed { background: #dbeafe; color: #1e40af; }
.date { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
.notes { font-size: 13px; margin-top: 6px; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-confirm { padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 6px; font-size: 13px; }
.btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-danger); color: var(--color-danger); border-radius: 6px; font-size: 13px; }
.btn-chat { display: block; margin-top: 12px; text-align: center; padding: 10px; background: var(--color-primary); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
</style>
