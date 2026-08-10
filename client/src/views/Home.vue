<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <main class="home">
    <h1>{{ t('app.name') }}</h1>
    <p>{{ t('app.tagline') }}</p>
  </main>
</template>

<style scoped>
.home {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}
.home h1 {
  color: var(--color-primary);
  margin-bottom: 8px;
}
.home p {
  color: var(--color-text-muted);
}
</style>
