<template>
  <nav class="bottom-nav">
    <router-link v-for="item in items" :key="item.to" :to="item.to" class="nav-item" active-class="active">
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const items = computed(() => [
  { to: '/timeline', icon: '🏠', label: t('nav.timeline') },
  { to: '/upload', icon: '➕', label: t('nav.upload') },
  { to: '/reports', icon: '📋', label: t('nav.reports') },
  { to: '/reminders', icon: '⏰', label: t('nav.reminders') },
  { to: '/profile', icon: '👤', label: t('nav.profile') },
]);
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
  z-index: 100;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  color: var(--color-text-muted);
  transition: color 0.2s;
}
.nav-item.active { color: var(--color-primary); }
.nav-icon { font-size: 22px; }
.nav-label { font-size: 11px; font-weight: 500; }
</style>
