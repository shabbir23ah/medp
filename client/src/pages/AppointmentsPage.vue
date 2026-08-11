<template>
  <AppLayout>
    <div class="page-hero">
      <h1>Appointments</h1>
      <p>{{ auth.isDoctor ? 'Manage your patient schedule.' : 'Track your doctor visits and follow-ups.' }}</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', { active: tab === 'upcoming' }]" @click="tab = 'upcoming'">Upcoming</button>
      <button :class="['tab', { active: tab === 'past' }]" @click="tab = 'past'">Past</button>
    </div>

    <div v-if="loading" class="state"><div class="spinner"></div></div>

    <div v-else-if="filteredAppts.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <h2>No {{ tab }} appointments</h2>
      <p v-if="!auth.isDoctor && tab === 'upcoming'">Find a doctor and book your first appointment.</p>
      <router-link v-if="!auth.isDoctor && tab === 'upcoming'" to="/doctors" class="cta-btn">Browse Doctors</router-link>
    </div>

    <div v-for="a in filteredAppts" :key="a.id" class="apt-card">
      <div class="apt-header">
        <span class="badge" :class="a.status">{{ a.status }}</span>
        <span class="apt-datetime">
          {{ fmtDate(a.scheduled_at) }} at {{ fmtTime(a.scheduled_at) }}
        </span>
      </div>

      <div class="apt-body">
        <div class="person">
          <div class="avatar-sm">{{ (a.other_name || '?')[0].toUpperCase() }}</div>
          <div>
            <strong>{{ a.other_name }}</strong>
            <span class="role-tag">{{ auth.isDoctor ? 'Patient' : 'Doctor' }}</span>
          </div>
        </div>
        <div class="apt-type-icon">
          {{ a.status === 'confirmed' ? '✅' : a.status === 'pending' ? '⏳' : a.status === 'cancelled' ? '❌' : '🏁' }}
        </div>
      </div>

      <div v-if="a.notes" class="apt-notes">📝 {{ a.notes }}</div>

      <!-- Actions -->
      <div class="apt-actions" v-if="a.status === 'pending'">
        <button @click="update(a.id, 'confirmed')" class="btn-accept">✓ Confirm</button>
        <button @click="update(a.id, 'cancelled')" class="btn-decline">✕ Decline</button>
      </div>

      <router-link
        v-if="a.status === 'confirmed'"
        :to="`/chat/${a.id}`"
        class="btn-chat"
      >
        💬 Open Chat
      </router-link>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const api = useApi();
const auth = useAuthStore();
const appts = ref<any[]>([]);
const loading = ref(true);
const tab = ref('upcoming');

const filteredAppts = computed(() => {
  const now = new Date();
  if (tab.value === 'upcoming') {
    return appts.value.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.scheduled_at) >= now);
  }
  return appts.value.filter(a => a.status === 'completed' || new Date(a.scheduled_at) < now);
});

async function fetch() {
  const { data } = await api.get('/appointments');
  if (data.ok) appts.value = data.data;
}

onMounted(async () => { await fetch(); loading.value = false; });

async function update(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  await fetch();
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
</script>

<style scoped>
.page-hero { margin-bottom: 20px; }
.page-hero h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 4px; }
.page-hero p { font-size: 14px; color: var(--text-muted); }

.tabs { display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 14px; margin-bottom: 20px; }
.tab { flex: 1; padding: 10px; border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-muted); text-align: center; transition: all 0.2s; }
.tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }

.state { text-align: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 48px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h2 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.empty-state p { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
.cta-btn { display: inline-block; padding: 12px 28px; background: var(--primary); color: var(--primary-text); border-radius: 14px; font-weight: 700; font-size: 14px; text-decoration: none; }

.apt-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}
.apt-card:hover { box-shadow: var(--shadow-md); }
.apt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.cancelled { background: var(--danger-bg); color: var(--danger); }
.badge.completed { background: var(--primary-bg); color: var(--primary); }
.apt-datetime { font-size: 13px; color: var(--text-muted); font-weight: 500; }
.apt-body { display: flex; justify-content: space-between; align-items: center; }
.person { display: flex; align-items: center; gap: 10px; }
.avatar-sm {
  width: 38px; height: 38px; border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px;
}
.role-tag { display: block; font-size: 12px; color: var(--text-muted); }
.apt-type-icon { font-size: 22px; }
.apt-notes { font-size: 13px; color: var(--text-secondary); margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
.apt-actions { display: flex; gap: 10px; margin-top: 14px; }
.btn-accept, .btn-decline { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; transition: transform 0.15s; }
.btn-accept:active, .btn-decline:active { transform: scale(0.96); }
.btn-accept { background: var(--success-bg); color: var(--success); }
.btn-decline { background: var(--danger-bg); color: var(--danger); }
.btn-chat {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 14px; padding: 12px;
  background: var(--primary); color: var(--primary-text);
  border-radius: 12px; text-decoration: none;
  font-weight: 700; font-size: 14px;
  transition: transform 0.15s;
}
.btn-chat:hover { transform: scale(1.01); }
</style>
