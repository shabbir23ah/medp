<template>
  <div class="card" :class="{ disabled: !reminder.enabled }">
    <div class="info">
      <div class="type-badge" :class="reminder.type">{{ $t(`reminder.${reminder.type}`) }}</div>
      <strong>{{ reminder.title }}</strong>
      <div class="datetime">{{ formatDateTime(reminder.datetime) }}</div>
      <div class="repeat" v-if="reminder.repeat_rule">{{ $t(`reminder.repeat${reminder.repeat_rule.charAt(0).toUpperCase() + reminder.repeat_rule.slice(1)}`) }}</div>
    </div>
    <div class="actions">
      <label class="toggle">
        <input type="checkbox" :checked="reminder.enabled" @change="$emit('toggle', reminder.id, !reminder.enabled)" />
        <span class="slider"></span>
      </label>
      <button @click="$emit('delete', reminder.id)" class="del-btn"><Trash2 :size="16" :stroke-width="2" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reminder } from '../stores/reminders';
import { Trash2 } from 'lucide-vue-next';
defineProps<{ reminder: Reminder }>();
defineEmits<{ toggle: [id: string, enabled: boolean]; delete: [id: string] }>();

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
</script>

<style scoped>
.card { display: flex; align-items: center; background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 14px; margin-bottom: 10px; }
.disabled { opacity: 0.5; }
.info { flex: 1; }
.type-badge { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; margin-bottom: 6px; }
.type-badge.medicine { background: #dbeafe; color: #1d4ed8; }
.type-badge.appointment { background: #fce7f3; color: #be185d; }
.type-badge.revisit { background: #d1fae5; color: #047857; }
.type-badge.report { background: #fef3c7; color: #b45309; }
.datetime { color: var(--text-muted); font-size: 13px; }
.repeat { color: var(--primary); font-size: 12px; }
.actions { display: flex; align-items: center; gap: 8px; }
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #ccc; border-radius: 24px; transition: 0.3s; }
.toggle input:checked + .slider { background: var(--primary); }
.slider::before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider::before { transform: translateX(20px); }
.del-btn { background: none; font-size: 18px; padding: 4px; }
</style>
