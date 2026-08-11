<template>
  <AppLayout>
    <h1 class="page-title">Find a Doctor</h1>
    <div class="search-bar">
      <span>🔍</span>
      <input v-model="search" placeholder="Search by name or specialization..." class="search-input" />
    </div>
    <div v-if="loading" class="state"><div class="spinner"></div></div>
    <div v-else-if="filtered.length === 0" class="state"><p>No doctors found</p></div>
    <router-link v-for="d in filtered" :key="d.id" :to="`/doctors/${d.id}`" class="doc-card">
      <div class="doc-avatar">{{ (d.name || 'D')[0].toUpperCase() }}</div>
      <div class="doc-info">
        <strong>{{ d.name || 'Unknown' }}</strong>
        <span class="doc-spec">{{ d.specialization || 'General Practitioner' }}</span>
        <span class="doc-fee">{{ d.consultation_fee ? '৳' + d.consultation_fee : 'Free' }}</span>
      </div>
      <span class="arrow">→</span>
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
const loading = ref(true);
const filtered = computed(() => {
  if (!search.value) return doctors.value;
  const q = search.value.toLowerCase();
  return doctors.value.filter((d: any) => (d.name || '').toLowerCase().includes(q) || (d.specialization || '').toLowerCase().includes(q));
});
onMounted(async () => { try { const { data } = await api.get('/doctors'); if (data.ok) doctors.value = data.data; } finally { loading.value = false; } });
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
.search-bar { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; margin-bottom: 20px; }
.search-bar:focus-within { border-color: var(--primary); }
.search-input { border: none !important; background: transparent !important; padding: 0 !important; font-size: 15px; flex: 1; }
.state { text-align: center; padding: 40px; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.doc-card { display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 8px; color: var(--text); text-decoration: none; transition: transform 0.15s; }
.doc-card:active { transform: scale(0.985); }
.doc-avatar { width: 48px; height: 48px; border-radius: 14px; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
.doc-info { flex: 1; }
.doc-info strong { display: block; font-size: 15px; margin-bottom: 2px; }
.doc-spec { display: block; font-size: 13px; color: var(--text-secondary); }
.doc-fee { display: block; font-size: 12px; color: var(--primary); font-weight: 600; margin-top: 2px; }
.arrow { color: var(--text-muted); font-size: 18px; }
</style>
