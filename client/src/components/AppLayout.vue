<template>
  <div class="app-layout">
    <header class="top-bar">
      <slot name="header">
        <h2>{{ title }}</h2>
      </slot>
    </header>
    <main class="content">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import BottomNav from './BottomNav.vue';
defineProps<{ title?: string }>();
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.top-bar {
  background: var(--color-primary);
  color: white;
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
}
.top-bar h2 { font-size: 18px; }
.content {
  flex: 1;
  padding: 16px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}
</style>
