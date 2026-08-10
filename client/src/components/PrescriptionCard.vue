<template>
  <router-link :to="`/prescriptions/${prescription.id}`" class="card">
    <img :src="prescription.image_url" alt="Prescription" class="thumb" />
    <div class="info">
      <div class="doctor">{{ prescription.doctor_name || 'Unknown Doctor' }}</div>
      <div class="hospital" v-if="prescription.hospital">{{ prescription.hospital }}</div>
      <div class="date">{{ formatDate(prescription.prescribed_date) }}</div>
      <div class="diagnosis" v-if="prescription.diagnosis">{{ prescription.diagnosis }}</div>
      <div class="medicines-preview" v-if="prescription.medicines?.length">
        💊 {{ prescription.medicines.map(m => m.name).join(', ') }}
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Prescription } from '../stores/prescriptions';

defineProps<{ prescription: Prescription }>();

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.card {
  display: flex;
  gap: 12px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 12px;
  margin-bottom: 12px;
  color: var(--color-text);
}
.thumb {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.doctor { font-weight: 600; margin-bottom: 2px; }
.hospital { color: var(--color-text-muted); font-size: 13px; }
.date { color: var(--color-primary); font-size: 13px; margin-top: 4px; }
.diagnosis { font-size: 13px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.medicines-preview { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
