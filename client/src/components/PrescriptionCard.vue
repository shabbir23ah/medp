<template>
  <router-link :to="`/prescriptions/${prescription.id}`" class="card">
    <div class="card-accent"></div>
    <div class="card-body">
      <div class="card-header">
        <div class="doctor-info">
          <div class="doctor-avatar">{{ (prescription.doctor_name || 'D')[0] }}</div>
          <div>
            <div class="doctor">{{ prescription.doctor_name || 'Unknown Doctor' }}</div>
            <div class="hospital" v-if="prescription.hospital">{{ prescription.hospital }}</div>
          </div>
        </div>
        <span class="date-badge">{{ formatDate(prescription.prescribed_date) }}</span>
      </div>
      <div class="card-meta" v-if="prescription.diagnosis">
        <span class="meta-label">Diagnosis</span>
        <span class="meta-value">{{ prescription.diagnosis }}</span>
      </div>
      <div class="card-footer" v-if="prescription.medicines?.length">
        <span class="pill-count">💊 {{ prescription.medicines.length }} medicine{{ prescription.medicines.length > 1 ? 's' : '' }}</span>
        <span class="med-names">{{ prescription.medicines.map(m => m.name).join(', ') }}</span>
      </div>
    </div>
    <div class="card-arrow">→</div>
  </router-link>
</template>

<script setup lang="ts">
import type { Prescription } from '../stores/prescriptions';

defineProps<{ prescription: Prescription }>();

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
</script>

<style scoped>
.card {
  display: flex;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 10px;
  color: var(--color-text);
  text-decoration: none;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid var(--color-border);
}
.card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.card-accent {
  width: 4px;
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-light));
  flex-shrink: 0;
}
.card-body {
  flex: 1;
  padding: 16px;
  min-width: 0;
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.doctor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.doctor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-primary-bg), var(--color-primary-bg));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  border: 1.5px solid rgba(13,148,136,0.15);
}
.doctor {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hospital {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
.card-meta {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 8px;
}
.meta-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  font-weight: 600;
}
.meta-value {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}
.pill-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.med-names {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-arrow {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--color-text-muted);
  font-size: 18px;
}
</style>
