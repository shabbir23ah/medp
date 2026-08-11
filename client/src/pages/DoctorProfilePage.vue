<template>
  <AppLayout title="Doctor Profile">
    <div v-if="loading" class="center">{{ $t('common.loading') }}</div>
    <div v-else-if="doctor" class="profile">
      <div class="header">
        <div class="avatar">{{ doctor.name ? doctor.name[0] : '👨‍⚕️' }}</div>
        <h2>{{ doctor.name }}</h2>
        <p class="spec">{{ doctor.specialization }}</p>
        <p class="fee">Consultation: {{ doctor.consultation_fee || 0 }} ৳</p>
      </div>
      <div v-if="doctor.bio" class="bio">{{ doctor.bio }}</div>
      <button @click="book" class="btn-primary">Book Appointment</button>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const route = useRoute();
const api = useApi();
const doctor = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get(`/doctors/${route.params.id}`);
    if (data.ok) doctor.value = data.data;
  } finally {
    loading.value = false;
  }
});

function book() {
  alert('Appointment booking coming soon');
}
</script>

<style scoped>
.center { text-align: center; padding: 40px; }
.profile { text-align: center; }
.header { margin-bottom: 24px; }
.avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(8,145,178,0.1); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 700; margin: 0 auto 16px;
}
h2 { font-size: 22px; margin-bottom: 4px; }
.spec { color: var(--color-text-muted); }
.fee { color: var(--color-primary); font-weight: 600; margin-top: 8px; }
.bio { background: var(--color-surface); padding: 16px; border-radius: 12px; margin: 16px 0; line-height: 1.6; }
.btn-primary {
  width: 100%; padding: 14px; background: var(--color-primary); color: white;
  border: none; border-radius: 10px; font-weight: 600; font-size: 16px;
}
</style>
