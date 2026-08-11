<template>
  <AppLayout :title="$t('nav.doctors')">
    <div v-if="loading" class="center">{{ $t('common.loading') }}</div>
    <div v-else-if="doctors.length === 0" class="center">No doctors found</div>
    <router-link v-for="d in doctors" :key="d.id" :to="`/doctors/${d.id}`" class="doctor-card">
      <div class="avatar">{{ d.name ? d.name[0] : '👨‍⚕️' }}</div>
      <div class="info">
        <strong>{{ d.name || 'Unknown Doctor' }}</strong>
        <span class="spec">{{ d.specialization || 'General' }}</span>
      </div>
      <span class="arrow">→</span>
    </router-link>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const doctors = ref<any[]>([]);
const loading = ref(true);

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
.center { text-align: center; padding: 40px; color: var(--color-text-muted); }
.doctor-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--color-surface); border-radius: 12px;
  padding: 16px; margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  color: var(--color-text); text-decoration: none;
}
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(8,145,178,0.1); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; flex-shrink: 0;
}
.info { flex: 1; }
.info strong { display: block; margin-bottom: 2px; }
.spec { color: var(--color-text-muted); font-size: 13px; }
.arrow { color: var(--color-text-muted); }
</style>
