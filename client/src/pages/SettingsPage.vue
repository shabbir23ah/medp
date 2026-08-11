<template>
  <AppLayout>
    <h1 class="page-title">Settings</h1>

    <!-- Appearance -->
    <div class="card">
      <h3 class="section-title">Appearance</h3>
      <div class="setting-row">
        <div><strong>Dark Mode</strong><p class="sub">Easier on the eyes at night</p></div>
        <label class="toggle">
          <input type="checkbox" :checked="theme.isDark.value" @change="theme.toggle()" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <div><strong>Language</strong></div>
        <select :value="locale" @change="switchLang(($event.target as HTMLSelectElement).value)" class="lang-select">
          <option v-for="l in availableLocales" :key="l.code" :value="l.code">{{ l.nativeName }}</option>
        </select>
      </div>
    </div>

    <!-- Notifications -->
    <div class="card">
      <h3 class="section-title">Notifications</h3>
      <p class="sub">Choose which types send you notifications</p>
      <div class="setting-row" v-for="t in notifTypes" :key="t.key">
        <span>{{ t.label }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="notifSettings[t.key]" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <p class="version">MedPrescription v2.0</p>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLayout from '../components/AppLayout.vue';
import { useTheme } from '../composables/useTheme';
import { availableLocales } from '../locales';

const { locale } = useI18n();
const theme = useTheme();

function switchLang(code: string) { locale.value = code; localStorage.setItem('language', code); }

const notifSettings = reactive({
  medicine: JSON.parse(localStorage.getItem('notif_medicine') || 'true'),
  appointment: JSON.parse(localStorage.getItem('notif_appointment') || 'true'),
  revisit: JSON.parse(localStorage.getItem('notif_revisit') || 'true'),
  report: JSON.parse(localStorage.getItem('notif_report') || 'true'),
});

import { watch } from 'vue';
watch(notifSettings, (val) => { Object.entries(val).forEach(([k, v]) => localStorage.setItem(`notif_${k}`, JSON.stringify(v))); }, { deep: true });

const notifTypes = [
  { key: 'medicine', label: 'Medicine' },
  { key: 'appointment', label: 'Appointment' },
  { key: 'revisit', label: 'Revisit' },
  { key: 'report', label: 'Report' },
];
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 800; margin-bottom: 20px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 14px; }
.section-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border-light); }
.setting-row:last-child { border-bottom: none; }
.sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: var(--border); border-radius: 26px; transition: 0.3s; }
.toggle input:checked + .slider { background: var(--primary); }
.slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider::before { transform: translateX(22px); }
.lang-select { padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 14px; width: auto; }
.version { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 8px; }
</style>
