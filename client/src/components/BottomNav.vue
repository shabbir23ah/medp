<template>
  <div class="mobile-nav">
    <nav class="pill-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="active"
        exact
      >
        <component :is="item.icon" class="nav-icon" :size="20" :stroke-width="2.2" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { Home, Stethoscope, ShoppingCart, Calendar, ClipboardList, User, LayoutDashboard, AlarmClock, Pill } from 'lucide-vue-next';

const { t } = useI18n();
const auth = useAuthStore();

const items = computed(() => {
  if (auth.isDoctor) {
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/reminders', icon: AlarmClock, label: 'Reminders' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];
  }
  if (auth.user?.role === 'pharmacy') {
    return [
      { to: '/pharmacy', icon: Pill, label: 'Catalog' },
      { to: '/reminders', icon: AlarmClock, label: 'Reminders' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];
  }
  return [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/shop', icon: ShoppingCart, label: 'Shop' },
    { to: '/plans', icon: ClipboardList, label: 'Plans' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];
});
</script>

<style scoped>
.mobile-nav {
  display: block;
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
  gap: 3px;
  padding: 8px 4px;
  border-radius: 16px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s;
}
.nav-item.active {
  color: var(--primary);
  background: var(--primary-bg);
}
.nav-icon { line-height: 1; }
.nav-label { font-size: 10px; font-weight: 600; }

@media (min-width: 768px) {
  .mobile-nav { display: none; }
}
</style>
