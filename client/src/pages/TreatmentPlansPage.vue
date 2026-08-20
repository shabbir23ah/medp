<template>
  <AppLayout>
    <div class="page-hero">
      <h1><ClipboardList :size="14" :stroke-width="2" class="inline-icon" /> Treatment Plans</h1>
      <p>Your care journey — milestones set by your doctors.</p>
    </div>

    <div v-if="loading" class="state"><div class="spinner"></div></div>

    <div v-else-if="plans.length === 0" class="empty-state">
      <span class="empty-icon"><Stethoscope :size="14" :stroke-width="2" class="inline-icon" /></span>
      <h2>No treatment plans yet</h2>
      <p>When your doctor creates a treatment plan for you, it will appear here with milestones you can track.</p>
    </div>

    <div v-for="plan in plans" :key="plan.id" class="plan-card">
      <div class="plan-header">
        <div>
          <h3>{{ plan.title }}</h3>
          <span class="doctor-name">👨‍⚕️ {{ plan.doctor_name }}</span>
        </div>
        <span class="plan-status" :class="plan.status">{{ plan.status }}</span>
      </div>

      <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

      <!-- Progress bar -->
      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPct(plan) + '%' }"></div>
        </div>
        <span class="progress-label">{{ completedCount(plan) }}/{{ plan.milestones?.length || 0 }} done</span>
      </div>

      <!-- Milestones -->
      <div class="milestones" v-if="plan.milestones?.length">
        <div v-for="m in plan.milestones" :key="m.id" class="milestone" :class="{ done: m.completed }">
          <button @click="toggle(m)" class="check-btn">
            {{ m.completed ? '✓' : '' }}
          </button>
          <div class="milestone-info">
            <strong :class="{ strikethrough: m.completed }">{{ m.title }}</strong>
            <span v-if="m.target_date" class="target"><Calendar :size="14" :stroke-width="2" class="inline-icon" /> {{ fmtDate(m.target_date) }}</span>
          </div>
        </div>
      </div>

      <div class="plan-footer">
        <span>Started {{ fmtDate(plan.start_date) }}</span>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { ClipboardList, Stethoscope, Calendar } from 'lucide-vue-next';

const api = useApi();
const plans = ref<any[]>([]);
const loading = ref(true);

async function load() {
  try {
    const { data } = await api.get('/enhancements/plans');
    if (data.ok) plans.value = data.data;
  } finally { loading.value = false; }
}

onMounted(load);

async function toggle(m: any) {
  const { data } = await api.put(`/enhancements/milestones/${m.id}`, { completed: !m.completed });
  if (data.ok) m.completed = data.data.completed;
}

function completedCount(plan: any) {
  return (plan.milestones || []).filter((m: any) => m.completed).length;
}

function progressPct(plan: any) {
  const total = plan.milestones?.length || 0;
  if (total === 0) return 0;
  return Math.round((completedCount(plan) / total) * 100);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; }
.page-hero h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
.page-hero p { font-size: 13px; color: var(--text-muted); }

.state { text-align: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 48px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; }
.empty-icon { font-size: 44px; display: block; margin-bottom: 10px; }
.empty-state h2 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.empty-state p { font-size: 13px; color: var(--text-muted); max-width: 320px; margin: 0 auto; line-height: 1.6; }

.plan-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
}
.plan-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.plan-header h3 { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.doctor-name { font-size: 12px; color: var(--text-muted); }
.plan-status { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.plan-status.active { background: var(--success-bg); color: var(--success); }
.plan-status.completed { background: var(--primary-bg); color: var(--primary); }
.plan-status.paused { background: var(--warning-bg); color: var(--warning); }
.plan-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

.progress-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.progress-bar { flex: 1; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); border-radius: 4px; transition: width 0.4s; }
.progress-label { font-size: 12px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }

.milestones { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.milestone { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg); border-radius: 10px; }
.milestone.done { opacity: 0.65; }
.check-btn {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid var(--border); background: var(--surface);
  color: var(--success); font-weight: 800; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.2s;
}
.milestone.done .check-btn { background: var(--success); border-color: var(--success); color: white; }
.milestone-info { flex: 1; }
.milestone-info strong { font-size: 13px; display: block; }
.strikethrough { text-decoration: line-through; color: var(--text-muted); }
.target { font-size: 11px; color: var(--text-muted); }
.plan-footer { font-size: 12px; color: var(--text-muted); padding-top: 10px; border-top: 1px solid var(--border-light); }
.inline-icon { display: inline-block; vertical-align: -2px; }
</style>
