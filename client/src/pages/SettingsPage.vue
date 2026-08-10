<template>
  <AppLayout :title="$t('settings.title')">
    <section class="section">
      <h3>{{ $t('settings.language') }}</h3>
      <LanguageSwitcher />
    </section>

    <section class="section">
      <h3>{{ $t('settings.notificationSettings') }}</h3>
      <p class="note">{{ $t('settings.notificationsNote') }}</p>

      <div class="toggle-row">
        <span>{{ $t('reminder.medicine') }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="notifSettings.medicine" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="toggle-row">
        <span>{{ $t('reminder.appointment') }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="notifSettings.appointment" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="toggle-row">
        <span>{{ $t('reminder.revisit') }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="notifSettings.revisit" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="toggle-row">
        <span>{{ $t('reminder.report') }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="notifSettings.report" />
          <span class="slider"></span>
        </label>
      </div>
    </section>

    <section class="section about">
      <h3>{{ $t('settings.about') }}</h3>
      <p>{{ $t('settings.version') }}</p>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const notifSettings = reactive({
  medicine: JSON.parse(localStorage.getItem('notif_medicine') || 'true'),
  appointment: JSON.parse(localStorage.getItem('notif_appointment') || 'true'),
  revisit: JSON.parse(localStorage.getItem('notif_revisit') || 'true'),
  report: JSON.parse(localStorage.getItem('notif_report') || 'true'),
});

// Watch and persist
import { watch } from 'vue';
watch(notifSettings, (val) => {
  Object.entries(val).forEach(([k, v]) => localStorage.setItem(`notif_${k}`, JSON.stringify(v)));
}, { deep: true });
</script>

<style scoped>
.section { margin-bottom: 28px; }
.section h3 { margin-bottom: 12px; font-size: 16px; }
.note { color: var(--color-text-muted); font-size: 13px; margin-bottom: 14px; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-border); }
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #ccc; border-radius: 24px; transition: 0.3s; }
.toggle input:checked + .slider { background: var(--color-primary); }
.slider::before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider::before { transform: translateX(20px); }
.about p { color: var(--color-text-muted); font-size: 14px; }
</style>
