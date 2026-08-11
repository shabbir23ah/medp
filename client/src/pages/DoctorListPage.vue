<template>
  <AppLayout>
    <div class="page-header">
      <h1>Find a Doctor</h1>
    </div>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="search" @input="filter" placeholder="Search by name or specialization..." class="search-input" />
    </div>

    <div v-if="loading" class="state"><div class="spinner"></div></div>

    <div v-else-if="filtered.length === 0" class="state">
      <p>No doctors found</p>
    </div>

    <router-link
      v-for="d in filtered"
      :key="d.id"
      :to="`/doctors/${d.id}`"
      class="doc-card"
    >
      <div class="doc-avatar">{{ (d.name || 'D')[0].toUpperCase() }}</div>
      <div class="doc-info">
        <strong>{{ d.name || 'Unknown' }}</strong>
        <span class="doc-spec">{{ d.specialization || 'General Practitioner' }}</span>
        <span class="doc-fee">{{ d.consultation_fee ? '৳' + d.consultation_fee : 'Free' }} consultation</span>
      </div>
      <span class="doc-arrow">→</span>
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
  return doctors.value.filter((d: any) =>
    (d.name || '').toLowerCase().includes(q) ||
    (d.specialization || '').toLowerCase().includes(q)
  );
});

onMounted(async () => {
  try {
    const { data } = await api.get('/doctors');
    if (data.ok) doctors.value = data.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.page-header h1 { font-size: 22px; font-weight: 700; }
.search-bar {
  display: flex; align-items: center; gap: 10px;
  background: var(--color-surface); border: 1.5px solid var(--color-border);
  border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px;
}
.search-bar:focus-within { border-color: var(--color-primary); }
.search-icon { font-size: 16px; }
.search-input { flex: 1; border: none; outline: none; font-size: 15px; background: transparent; }
.state { text-align: center; padding: 40px; color: var(--color-text-muted); }
.spinner {
  width: 28px; height: 28px; border: 3px solid var(--color-border);
  border-top-color: var(--color-primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.doc-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 8px;
  color: var(--color-text); text-decoration: none;
  transition: box-shadow 0.2s;
}
.doc-card:hover { box-shadow: var(--shadow-md); }
.doc-avatar {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary-bg), rgba(13,148,136,0.08));
  color: var(--color-primary); display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; flex-shrink: 0;
  border: 1.5px solid rgba(13,148,136,0.15);
}
.doc-info { flex: 1; }
.doc-info strong { display: block; font-size: 15px; margin-bottom: 2px; }
.doc-spec { display: block; font-size: 13px; color: var(--color-text-secondary); }
.doc-fee { display: block; font-size: 12px; color: var(--color-primary); font-weight: 600; margin-top: 2px; }
.doc-arrow { color: var(--color-text-muted); font-size: 18px; }
</style>
