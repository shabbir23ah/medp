<template>
  <AppLayout>
    <div class="page-hero">
      <h1>Dr. {{ auth.user?.name || 'Doctor' }}</h1>
      <p>{{ today }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card accent">
        <span class="stat-num">{{ stats.today }}</span>
        <span class="stat-label">Today's Appointments</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.pending }}</span>
        <span class="stat-label">Pending Requests</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">Total Patients</span>
      </div>
    </div>

    <!-- Quick Rx Builder -->
    <div class="section-card">
      <div class="section-head">
        <h3><Pill :size="16" :stroke-width="2" /> Quick Prescription Builder</h3>
      </div>
      <div class="rx-builder">
        <div class="rx-meds-input">
          <input v-model="rxDrug" placeholder="Add medicine name (e.g. Warfarin)" @keyup.enter="addDrug" />
          <button @click="addDrug" class="btn-add-drug">+</button>
        </div>
        <div class="rx-chips" v-if="rxDrugs.length > 0">
          <span v-for="(d, i) in rxDrugs" :key="i" class="rx-chip">
            {{ d }} <button @click="rxDrugs.splice(i, 1)" class="chip-x">✕</button>
          </span>
        </div>
        <button v-if="rxDrugs.length >= 2" @click="checkDrugs" :disabled="checking" class="btn-check">
          <Search :size="14" :stroke-width="2" v-if="!checking" />
          {{ checking ? 'Checking...' : 'Check Interactions' }}
        </button>
        <div v-if="interactions.length > 0" class="interaction-results">
          <div v-for="(ix, i) in interactions" :key="i" class="interaction-item" :class="ix.severity">
            <span class="ix-sev">{{ ix.severity.toUpperCase() }}</span>
            <strong>{{ ix.drug_a }} + {{ ix.drug_b }}</strong>
            <p>{{ ix.description }}</p>
          </div>
        </div>
        <p v-if="checked && interactions.length === 0" class="safe-msg">✓ No known interactions found</p>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <h3><Calendar :size="16" :stroke-width="2" /> Today's Schedule</h3>
      </div>
      <div v-if="todayAppts.length === 0" class="empty">No appointments today</div>
      <div v-for="a in todayAppts" :key="a.id" class="apt-item">
        <div class="apt-time">{{ fmtTime(a.scheduled_at) }}</div>
        <div class="apt-info">
          <div class="apt-person">
            <div class="avatar-xs">{{ (a.other_name || '?')[0] }}</div>
            <div>
              <strong>{{ a.other_name }}</strong>
              <span class="badge" :class="a.status">{{ a.status }}</span>
            </div>
          </div>
          <div v-if="a.notes" class="apt-note">{{ a.notes }}</div>
        </div>
        <div class="apt-actions" v-if="a.status === 'pending'">
          <button @click="update(a.id, 'confirmed')" class="btn-accept">✓</button>
          <button @click="update(a.id, 'cancelled')" class="btn-decline">✕</button>
        </div>
        <router-link v-if="a.status === 'confirmed'" :to="`/chat/${a.id}`" class="btn-chat">Chat</router-link>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <h3><Users :size="16" :stroke-width="2" /> All Appointments</h3>
        <router-link to="/appointments" class="see-all">View all →</router-link>
      </div>
      <div v-if="allAppts.length === 0" class="empty">No appointments yet</div>
      <div v-for="a in allAppts.slice(0, 5)" :key="a.id" class="apt-item simple">
        <div class="apt-person">
          <div class="avatar-xs">{{ (a.other_name || '?')[0] }}</div>
          <div>
            <strong>{{ a.other_name }}</strong>
            <span>{{ fmtShort(a.scheduled_at) }}</span>
          </div>
        </div>
        <span class="badge sm" :class="a.status">{{ a.status }}</span>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';
import { Pill, Search, Calendar, Users } from 'lucide-vue-next';

const auth = useAuthStore();
const api = useApi();

const allAppts = ref<any[]>([]);
const stats = ref({ today: 0, pending: 0, total: 0 });
const rxDrug = ref('');
const rxDrugs = ref<string[]>([]);
const interactions = ref<any[]>([]);
const checking = ref(false);
const checked = ref(false);

function addDrug() {
  if (rxDrug.value.trim() && rxDrugs.value.length < 10) {
    rxDrugs.value.push(rxDrug.value.trim());
    rxDrug.value = '';
    interactions.value = [];
    checked.value = false;
  }
}

async function checkDrugs() {
  if (rxDrugs.value.length < 2) return;
  checking.value = true;
  checked.value = false;
  try {
    const { data } = await api.post('/enhancements/drug-check', { drugs: rxDrugs.value });
    if (data.ok) {
      interactions.value = data.data;
      checked.value = true;
    }
  } finally { checking.value = false; }
}

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const todayStr = new Date().toISOString().slice(0, 10);

const todayAppts = computed(() =>
  allAppts.value.filter(a => a.scheduled_at.startsWith(todayStr) && a.status !== 'cancelled')
);

onMounted(async () => {
  const { data } = await api.get('/appointments');
  if (data.ok) {
    allAppts.value = data.data;
    stats.value.today = todayAppts.value.length;
    stats.value.pending = data.data.filter((a: any) => a.status === 'pending').length;
    stats.value.total = data.data.length;
  }
});

async function update(id: string, status: string) {
  await api.put(`/appointments/${id}`, { status });
  const { data } = await api.get('/appointments');
  if (data.ok) allAppts.value = data.data;
}

function fmtTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function fmtShort(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 2px; }
.page-hero p { font-size: 13px; color: var(--text-muted); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px; text-align: center;
}
.stat-card.accent { background: var(--primary-bg); border-color: transparent; }
.stat-num { font-size: 24px; font-weight: 800; display: block; }
.stat-card.accent .stat-num { color: var(--primary); }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

.section-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
}
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-head h3 { font-size: 16px; font-weight: 700; }
.see-all { font-size: 13px; color: var(--primary); font-weight: 600; }

.apt-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.apt-item:last-child { border-bottom: none; }
.apt-item.simple { padding: 10px 0; }
.apt-time { font-size: 14px; font-weight: 700; min-width: 44px; color: var(--text-secondary); }
.apt-info { flex: 1; min-width: 0; }
.apt-person { display: flex; align-items: center; gap: 8px; }
.avatar-xs {
  width: 28px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text); display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.apt-person strong { font-size: 14px; }
.apt-person span { font-size: 12px; color: var(--text-muted); display: block; }
.apt-note { font-size: 12px; color: var(--text-muted); margin-top: 4px; padding-left: 36px; }

.badge {
  display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-left: 8px;
}
.badge.sm { font-size: 10px; }
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.cancelled { background: var(--danger-bg); color: var(--danger); }
.badge.completed { background: var(--primary-bg); color: var(--primary); }

.apt-actions { display: flex; gap: 6px; }
.btn-accept, .btn-decline {
  width: 32px; height: 32px; border-radius: 8px; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.btn-accept { background: var(--success-bg); color: var(--success); }
.btn-decline { background: var(--danger-bg); color: var(--danger); }
.btn-chat {
  padding: 8px 14px; background: var(--primary); color: var(--primary-text);
  border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none;
}
.empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
.rx-builder { display: flex; flex-direction: column; gap: 10px; }
.rx-meds-input { display: flex; gap: 8px; }
.rx-meds-input input {
  flex: 1; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px;
  font-size: 14px; background: var(--bg); color: var(--text);
}
.rx-meds-input input:focus { border-color: var(--primary); outline: none; }
.btn-add-drug { padding: 10px 16px; background: var(--primary); color: var(--primary-text); border-radius: 10px; font-weight: 700; }
.rx-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.rx-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: var(--primary-bg); color: var(--primary);
  border-radius: 20px; font-size: 13px; font-weight: 600;
}
.chip-x { color: var(--danger); font-weight: 700; font-size: 12px; }
.btn-check { padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; font-weight: 700; font-size: 13px; }
.btn-check:disabled { opacity: 0.5; }
.interaction-results { display: flex; flex-direction: column; gap: 8px; }
.interaction-item { padding: 12px; border-radius: 10px; border-left: 4px solid; }
.interaction-item.severe { background: var(--danger-bg); border-color: var(--danger); }
.interaction-item.moderate { background: var(--warning-bg); border-color: var(--warning); }
.interaction-item.mild { background: var(--bg-secondary); border-color: var(--text-muted); }
.ix-sev { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
.interaction-item.severe .ix-sev { color: var(--danger); }
.interaction-item.moderate .ix-sev { color: var(--warning); }
.interaction-item p { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.safe-msg { color: var(--success); font-size: 13px; font-weight: 600; text-align: center; padding: 8px; }
h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }
</style>
