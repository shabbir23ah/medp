<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <div class="avatar-sm" @click="$router.push('/profile')">
          <span v-if="auth.user?.profilePic">
            <img :src="auth.user.profilePic" alt="" />
          </span>
          <span v-else>{{ (auth.user?.name || 'U')[0].toUpperCase() }}</span>
        </div>
        <div>
          <p class="greeting">{{ greeting }}</p>
          <p class="username">{{ auth.user?.name || 'User' }}</p>
        </div>
      </div>
      <div class="topbar-right">
        <button class="icon-btn" @click="$router.push('/settings')">⚙️</button>
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

const auth = useAuthStore();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding-bottom: 90px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  padding-top: max(14px, env(safe-area-inset-top));
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.greeting {
  font-size: 12px;
  color: var(--color-text-muted);
}
.username {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid var(--color-border);
}
.main-content {
  padding: 20px 16px;
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
}
</style>
