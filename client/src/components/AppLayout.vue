<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand" @click="$router.push('/timeline')">
        <span class="brand-icon">💊</span>
        <span class="brand-name">MedPrescription</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          active-class="active"
          exact
        >
          <span class="sidebar-icon">{{ item.icon }}</span>
          <span class="sidebar-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-item" @click="theme.toggle()">
          <span class="sidebar-icon">{{ theme.isDark.value ? '☀️' : '🌙' }}</span>
          <span class="sidebar-label">{{ theme.isDark.value ? 'Light' : 'Dark' }}</span>
        </button>
        <router-link to="/profile" class="sidebar-item" active-class="active">
          <div class="sidebar-avatar">
            <img v-if="auth.user?.profilePic" :src="auth.user.profilePic" alt="" />
            <span v-else>{{ (auth.user?.name || 'U')[0].toUpperCase() }}</span>
          </div>
          <span class="sidebar-label">{{ auth.user?.name || 'Profile' }}</span>
        </router-link>
      </div>
    </aside>

    <!-- Main area -->
    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <p class="greeting">{{ greeting }}, <strong>{{ auth.user?.name || 'User' }}</strong></p>
        </div>
        <div class="topbar-right">
          <button class="icon-btn" @click="theme.toggle()">
            {{ theme.isDark.value ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <main class="main-content">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BottomNav from './BottomNav.vue';
import { useAuthStore } from '../stores/auth';
import { useTheme } from '../composables/useTheme';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const theme = useTheme();
const { t } = useI18n();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});

const navItems = computed(() => {
  if (auth.isDoctor) {
    return [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/appointments', icon: '📅', label: 'Appointments' },
      { to: '/reminders', icon: '⏰', label: 'Reminders' },
    ];
  }
  if (auth.user?.role === 'pharmacy') {
    return [
      { to: '/pharmacy', icon: '💊', label: 'Catalog' },
      { to: '/reminders', icon: '⏰', label: 'Reminders' },
    ];
  }
  return [
    { to: '/timeline', icon: '🏠', label: 'Timeline' },
    { to: '/doctors', icon: '👨‍⚕️', label: 'Find Doctor' },
    { to: '/appointments', icon: '📅', label: 'Appointments' },
    { to: '/upload', icon: '➕', label: 'Upload' },
  ];
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--bg);
}

/* Sidebar — desktop only */
.sidebar {
  display: none;
  width: 240px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 20px 12px;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px 24px;
  cursor: pointer;
}
.brand-icon { font-size: 24px; }
.brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.sidebar-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 12px;
  color: var(--text-secondary); text-decoration: none;
  font-size: 14px; font-weight: 500;
  transition: all 0.15s;
}
.sidebar-item:hover { background: var(--bg-secondary); color: var(--text); }
.sidebar-item.active { background: var(--primary-bg); color: var(--primary); font-weight: 600; }
.sidebar-icon { font-size: 18px; width: 24px; text-align: center; }
.sidebar-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-footer { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 12px; display: flex; flex-direction: column; gap: 2px; }
.sidebar-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex; align-items: center; justify-content: center;
  color: var(--primary-text); font-size: 11px; font-weight: 700;
  overflow: hidden; flex-shrink: 0;
}
.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Main area */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 40;
}
.topbar-left { min-width: 0; }
.greeting { font-size: 14px; color: var(--text-secondary); }
.greeting strong { color: var(--text); }
.icon-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; transition: background 0.15s;
}
.icon-btn:hover { background: var(--border); }

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 960px;
  width: 100%;
}

/* Desktop */
@media (min-width: 768px) {
  .sidebar { display: flex; }
  .topbar { padding-left: 32px; padding-right: 32px; }
}

/* Mobile-only bottom nav */
@media (max-width: 767px) {
  .app-shell { padding-bottom: 80px; }
  .main-content { padding: 16px; max-width: 100%; }
}
</style>
