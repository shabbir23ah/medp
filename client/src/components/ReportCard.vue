<template>
  <div class="card">
    <img :src="report.image_url" alt="Report" class="thumb" @click="$emit('view', report)" />
    <div class="info">
      <strong>{{ report.report_type || 'Report' }}</strong>
      <div class="sub" v-if="report.lab_name">{{ report.lab_name }}</div>
      <div class="date" v-if="report.report_date">{{ report.report_date }}</div>
    </div>
    <button @click="$emit('delete', report.id)" class="del-btn">🗑</button>
  </div>
</template>

<script setup lang="ts">
import type { Report } from '../stores/reports';
defineProps<{ report: Report }>();
defineEmits<{ view: [report: Report]; delete: [id: string] }>();
</script>

<style scoped>
.card { display: flex; gap: 12px; align-items: center; background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 12px; margin-bottom: 12px; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; }
.info { flex: 1; }
.sub { color: var(--color-text-muted); font-size: 13px; }
.date { color: var(--color-primary); font-size: 13px; }
.del-btn { background: none; font-size: 18px; padding: 4px 8px; }
</style>
