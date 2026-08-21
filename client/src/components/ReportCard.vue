<template>
  <div class="card">
    <img :src="report.image_url" alt="Report" class="thumb" @click="$emit('view', report)" />
    <div class="info">
      <strong>{{ report.report_type || 'Report' }}</strong>
      <div class="sub" v-if="report.lab_name">{{ report.lab_name }}</div>
      <div class="date" v-if="report.report_date">{{ report.report_date }}</div>
    </div>
    <button
      @click="$emit('delete', report.id)"
      class="del-btn"
      :class="{ confirming: confirming }"
      :aria-label="confirming ? 'Tap again to confirm delete' : 'Delete report'"
    >
      <span v-if="confirming" class="del-confirm">Tap again</span>
      <Trash2 v-else :size="16" :stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Report } from '../stores/reports';
import { Trash2 } from 'lucide-vue-next';
defineProps<{ report: Report; confirming?: boolean }>();
defineEmits<{ view: [report: Report]; delete: [id: string] }>();
</script>

<style scoped>
.card { display: flex; gap: 12px; align-items: center; background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 12px; margin-bottom: 12px; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; }
.info { flex: 1; }
.sub { color: var(--text-muted); font-size: 13px; }
.date { color: var(--primary); font-size: 13px; }
.del-btn { background: none; font-size: 18px; padding: 4px 8px; border-radius: 8px; }
.del-btn.confirming { background: var(--danger-bg); color: var(--danger); }
.del-confirm { font-size: 11px; font-weight: 700; white-space: nowrap; padding: 0 4px; }
</style>
