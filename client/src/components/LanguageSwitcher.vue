<template>
  <div class="lang-switcher">
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      :class="{ active: locale === loc.code }"
      @click="switchTo(loc.code)"
    >
      {{ loc.nativeName }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { availableLocales, type Locale } from '../locales';

const { locale } = useI18n();

function switchTo(code: Locale) {
  locale.value = code;
  localStorage.setItem('language', code);
}
</script>

<style scoped>
.lang-switcher { display: flex; gap: 8px; flex-wrap: wrap; }
.lang-switcher button {
  padding: 8px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  font-size: 14px;
}
.lang-switcher button.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}
</style>
