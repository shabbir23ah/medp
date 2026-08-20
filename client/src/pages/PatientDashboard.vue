<template>
  <AppLayout>
    <div class="page-hero">
      <h1>Hello, {{ auth.user?.name || 'there' }} 👋</h1>
      <p>{{ today }}</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-row">
      <div class="stat-card accent" @click="$router.push('/timeline')">
        <ClipboardList class="stat-icon" :size="22" :stroke-width="2" />
        <span class="stat-num">{{ stats.prescriptions }}</span>
        <span class="stat-label">Prescriptions</span>
      </div>
      <div class="stat-card" @click="$router.push('/appointments')">
        <Calendar class="stat-icon" :size="22" :stroke-width="2" />
        <span class="stat-num">{{ stats.appointments }}</span>
        <span class="stat-label">Appointments</span>
      </div>
      <div class="stat-card" @click="$router.push('/reminders')">
        <AlarmClock class="stat-icon" :size="22" :stroke-width="2" />
        <span class="stat-num">{{ stats.reminders }}</span>
        <span class="stat-label">Reminders</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-row">
      <router-link to="/upload" class="action-btn">
        <Camera class="action-icon" :size="24" :stroke-width="2" />
        <span>Upload Prescription</span>
      </router-link>
      <router-link to="/doctors" class="action-btn">
        <Stethoscope class="action-icon" :size="24" :stroke-width="2" />
        <span>Find Doctor</span>
      </router-link>
      <router-link to="/appointments" class="action-btn">
        <Calendar class="action-icon" :size="24" :stroke-width="2" />
        <span>Appointments</span>
      </router-link>
    </div>

    <!-- Upcoming Reminders -->
    <div class="section-card">
      <div class="section-head">
        <h3><AlarmClock :size="16" :stroke-width="2" /> Upcoming Reminders</h3>
        <router-link to="/reminders" class="see-all">See all →</router-link>
      </div>
      <div v-if="upcomingReminders.length === 0" class="empty">No upcoming reminders</div>
      <div v-for="r in upcomingReminders" :key="r.id" class="reminder-item">
        <component :is="r.type === 'medicine' ? Pill : r.type === 'appointment' ? Calendar : Bell" class="rem-type" :size="18" :stroke-width="2" />
        <div class="rem-info">
          <strong>{{ r.title }}</strong>
          <span>{{ fmtDate(r.datetime) }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Prescriptions -->
    <div class="section-card">
      <div class="section-head">
        <h3><ClipboardList :size="16" :stroke-width="2" /> Recent Prescriptions</h3>
        <router-link to="/timeline" class="see-all">View all →</router-link>
      </div>
      <div v-if="recentRx.length === 0" class="empty">
        <p>No prescriptions yet.</p>
        <router-link to="/upload" class="cta-link">Upload your first →</router-link>
      </div>
      <PrescriptionCard v-for="p in recentRx.slice(0, 3)" :key="p.id" :prescription="p" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import PrescriptionCard from '../components/PrescriptionCard.vue';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';
import { ClipboardList, Calendar, AlarmClock, Camera, Stethoscope, Pill, Bell } from 'lucide-vue-next';

const auth = useAuthStore();
const api = useApi();

const stats = ref({ prescriptions: 0, appointments: 0, reminders: 0 });
const recentRx = ref<any[]>([]);
const upcomingReminders = ref<any[]>([]);

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

onMounted(async () => {
  try {
    const [rxRes, aptRes, remRes] = await Promise.all([
      api.get('/prescriptions?limit=5'),
      api.get('/appointments'),
      api.get('/reminders'),
    ]);
    if (rxRes.data.ok) {
      recentRx.value = rxRes.data.data.prescriptions || [];
      stats.value.prescriptions = rxRes.data.data.total || 0;
    }
    if (aptRes.data.ok) {
      stats.value.appointments = aptRes.data.data.length || 0;
    }
    if (remRes.data.ok) {
      const rems = remRes.data.data || [];
      stats.value.reminders = rems.length;
      upcomingReminders.value = rems.filter((r: any) => r.enabled).slice(0, 4);
    }
  } catch {}
});

function fmtDate(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 2px; }
.page-hero p { font-size: 13px; color: var(--text-muted); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px; text-align: center; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.stat-card.accent { background: var(--primary-bg); border-color: transparent; }
.stat-icon { font-size: 22px; display: block; margin-bottom: 6px; }
.stat-num { font-size: 24px; font-weight: 800; display: block; }
.stat-card.accent .stat-num { color: var(--primary); }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

.actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; text-decoration: none; color: var(--text);
  font-size: 12px; font-weight: 600; transition: transform 0.15s;
}
.action-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.action-icon { font-size: 24px; }

.section-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
}
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-head h3 { font-size: 16px; font-weight: 700; }
.see-all { font-size: 13px; color: var(--primary); font-weight: 600; }

.reminder-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.reminder-item:last-child { border-bottom: none; }
.rem-type { font-size: 18px; }
.rem-info { flex: 1; }
.rem-info strong { display: block; font-size: 14px; }
.rem-info span { font-size: 12px; color: var(--text-muted); }

.empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
.cta-link { color: var(--primary); font-weight: 600; font-size: 13px; }
h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }

/* Mobile: consistent card sizing */
@media (max-width: 480px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat-card { padding: 14px 8px; }
  .stat-num { font-size: 20px; }
  .stat-label { font-size: 10px; letter-spacing: 0; }
  .actions-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .action-btn { padding: 12px 6px; font-size: 11px; }
  .action-icon { font-size: 20px; }
}
</style>
