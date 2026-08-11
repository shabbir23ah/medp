<template>
  <AppLayout>
    <div class="page-hero">
      <h1>Find a Doctor</h1>
      <p>Browse specialists and book appointments instantly.</p>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="search"
        placeholder="Search by name or specialization..."
        class="search-input"
      />
      <select v-model="specialization" class="filter-select" @change="fetchDoctors">
        <option value="">All Specialties</option>
        <option value="Cardiologist">Cardiologist</option>
        <option value="Neurologist">Neurologist</option>
        <option value="Dermatologist">Dermatologist</option>
        <option value="Pediatrician">Pediatrician</option>
        <option value="Orthopedic">Orthopedic</option>
        <option value="General">General Practitioner</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state">
      <div class="spinner"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="state">
      <p>No doctors found matching your search.</p>
    </div>

    <!-- List -->
    <router-link v-for="d in filtered" :key="d.id" :to="`/doctors/${d.id}`" class="doc-card">
      <div class="doc-rank" v-if="d.consultation_fee">
        <span class="rank-badge">⭐ Top Rated</span>
      </div>
      <div class="doc-main">
        <div class="doc-avatar">
          {{ (d.name || 'D')[0].toUpperCase() }}
        </div>
        <div class="doc-info">
          <div class="doc-name-row">
            <strong>{{ d.name || 'Unknown' }}</strong>
            <span class="verified" v-if="d.license_number">✓ Verified</span>
          </div>
          <span class="doc-spec">{{ d.specialization || 'General Practitioner' }}</span>
          <div class="doc-meta">
            <span class="meta-chip">📅 Available Today</span>
            <span class="meta-chip fee">৳{{ d.consultation_fee || 0 }}</span>
          </div>
        </div>
        <span class="doc-arrow">→</span>
      </div>
    </router-link>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const doctors = ref<any[]>([]);
const search = ref('');
const specialization = ref('');
const loading = ref(true);

async function fetchDoctors() {
  loading.value = true;
  try {
    const params: any = {};
    if (specialization.value) params.specialization = specialization.value;
    const { data } = await api.get('/doctors', { params });
    if (data.ok) doctors.value = data.data;
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  if (!search.value) return doctors.value;
  const q = search.value.toLowerCase();
  return doctors.value.filter((d: any) =>
    (d.name || '').toLowerCase().includes(q) ||
    (d.specialization || '').toLowerCase().includes(q)
  );
});

onMounted(fetchDoctors);
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 4px; }
.page-hero p { font-size: 14px; color: var(--text-muted); }

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 24px;
  transition: border-color 0.2s;
}
.search-bar:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
.search-icon { font-size: 16px; padding-left: 8px; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  padding: 10px 4px !important;
  font-size: 15px;
  outline: none;
  min-width: 0;
}
.filter-select {
  padding: 10px 14px;
  border: none;
  border-left: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
}
.state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.doc-card {
  display: block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  margin-bottom: 12px;
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  transition: all 0.2s;
}
.doc-card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.doc-rank {
  background: linear-gradient(135deg, var(--primary-bg), rgba(20,184,166,0.05));
  padding: 8px 20px;
}
.rank-badge { font-size: 11px; font-weight: 700; color: var(--primary); }
.doc-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}
.doc-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 22px;
  flex-shrink: 0;
}
.doc-info { flex: 1; min-width: 0; }
.doc-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.doc-name-row strong { font-size: 16px; }
.verified { font-size: 11px; color: var(--success); font-weight: 600; background: var(--success-bg); padding: 2px 8px; border-radius: 6px; }
.doc-spec { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
.doc-meta { display: flex; gap: 8px; }
.meta-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}
.meta-chip.fee {
  background: var(--primary-bg);
  color: var(--primary);
}
.doc-arrow { color: var(--text-muted); font-size: 20px; flex-shrink: 0; }
</style>
