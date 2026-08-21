<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();

// Re-sync the profile from the server on boot. localStorage is only a
// cache — the DB is the source of truth, so any staleness (e.g. a save
// that updated the server but not the cache) self-heals here.
onMounted(() => {
  if (auth.isAuthenticated) auth.fetchProfile();
});
</script>
