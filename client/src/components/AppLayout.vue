<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <div class="avatar-sm" @click="$router.push('/profile')">
          <img v-if="auth.user?.profilePic" :src="auth.user.profilePic" alt="" />
          <span v-else>{{ (auth.user?.name || 'U')[0].toUpperCase() }}</span>
        </div>
        <div class="topbar-text">
          <p class="greeting">{{ greeting }}</p>
          <p class="username">{{ auth.user?.name || 'User' }}</p>
        </div>
      </div>
      <div class="topbar-right">
        <button class="icon-btn" @click="theme.toggle()" :title="theme.isDark.value ? 'Light mode' : 'Dark mode'">
          {{ theme.isDark.value ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BottomNav from './BottomNav.vue';
import { useAuthStore } from '../stores/auth';
import { useTheme } from '../composables/useTheme';

const auth = useAuthStore();
const theme = useTheme();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  padding-top: max(14px, env(safe-area-inset-top));
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-text);
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.greeting { font-size: 11px; color: var(--text-muted); }
.username { font-size: 15px; font-weight: 600; }
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  transition: background 0.2s;
}
.icon-btn:active { background: var(--border); }
.main-content {
  flex: 1;
  padding: 20px 16px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}
</style>
