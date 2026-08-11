<template>
  <div class="nav-container">
    <nav class="pill-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="active"
        exact
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';

const { t } = useI18n();
const auth = useAuthStore();

const items = computed(() => {
  if (auth.isDoctor) {
    return [
      { to: '/dashboard', icon: '📊', label: t('nav.dashboard') },
      { to: '/appointments', icon: '📅', label: t('nav.appointments') },
      { to: '/reminders', icon: '⏰', label: t('nav.reminders') },
      { to: '/profile', icon: '👤', label: t('nav.profile') },
    ];
  }
  return [
    { to: '/timeline', icon: '🏠', label: t('nav.timeline') },
    { to: '/doctors', icon: '👨‍⚕️', label: t('nav.doctors') },
    { to: '/appointments', icon: '📅', label: t('nav.appointments') },
    { to: '/upload', icon: '➕', label: t('nav.upload') },
    { to: '/profile', icon: '👤', label: t('nav.profile') },
  ];
});
</script>

<style scoped>
.nav-container {
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 0 16px;
  width: 100%;
  max-width: 440px;
}
.pill-nav {
  display: flex;
  background: var(--surface);
  border-radius: 20px;
  padding: 4px;
  box-shadow: var(--nav-shadow);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 16px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}
.nav-item.active {
  color: var(--primary);
  background: var(--primary-bg);
}
.nav-icon { font-size: 20px; line-height: 1; }
.nav-label { font-size: 10px; font-weight: 600; }
</style>
