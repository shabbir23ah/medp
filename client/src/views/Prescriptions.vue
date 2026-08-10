<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <main class="prescriptions">
    <h1>{{ t('app.name') }} — {{ t('common.search') }}</h1>
    <p>{{ t('common.loading') }}</p>
  </main>
</template>

<style scoped>
.prescriptions {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}
</style>
