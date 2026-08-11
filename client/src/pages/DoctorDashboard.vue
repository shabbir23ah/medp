<template>
  <AppLayout>
    <h1 class="page-title">Dashboard</h1>
    <div class="stats-row">
      <div class="stat-card"><span class="stat-num">{{ appts.length }}</span><span class="stat-label">Total</span></div>
      <div class="stat-card"><span class="stat-num">{{ pending }}</span><span class="stat-label">Pending</span></div>
    </div>
    <h3 class="section-title">Schedule</h3>
    <div v-if="appts.length === 0" class="state"><p>No appointments</p></div>
    <div v-for="a in appts" :key="a.id" class="card">
      <div class="card-top">
        <span class="badge" :class="a.status">{{ a.status }}</span>
        <span class="date">{{ fmtTime(a.scheduled_at) }}</span>
      </div>
      <div class="person-row">
        <div class="avatar">{{ (a.other_name || '?')[0] }}</div>
        <strong>{{ a.other_name }}</strong>
      </div>
      <div class="actions" v-if="a.status === 'pending'">
        <button @click="update(a.id, 'confirmed')" class="btn-accept">Confirm</button>
        <button @click="update(a.id, 'cancelled')" class="btn-decline">Cancel</button>
      </div>
      <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">Open Chat →</router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
const api = useApi();
const appts = ref<any[]>([]);
const pending = computed(() => appts.value.filter(a => a.status === 'pending').length);
onMounted(async () => { const { data } = await api.get('/appointments'); if (data.ok) appts.value = data.data; });
async function update(id: string, status: string) { await api.put(`/appointments/${id}`, { status }); const { data } = await api.get('/appointments'); if (data.ok) appts.value = data.data; }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 800; margin-bottom: 20px; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; text-align: center; }
.stat-num { display: block; font-size: 34px; font-weight: 800; color: var(--primary); }
.stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.state { text-align: center; padding: 32px; color: var(--text-muted); }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 8px; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.cancelled { background: var(--danger-bg); color: var(--danger); }
.badge.completed { background: var(--primary-bg); color: var(--primary); }
.date { font-size: 13px; color: var(--text-muted); }
.person-row { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-accept, .btn-decline { flex: 1; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; }
.btn-accept { background: var(--success-bg); color: var(--success); }
.btn-decline { background: var(--danger-bg); color: var(--danger); }
.btn-chat { display: block; margin-top: 12px; text-align: center; padding: 12px; background: var(--primary); color: var(--primary-text); border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; }
</style>
