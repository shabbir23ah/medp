import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import en from './en.json';
import bn from './bn.json';
import es from './es.json';
import fr from './fr.json';

export type Locale = 'en' | 'bn' | 'es' | 'fr';

export const availableLocales: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

function getInitialLocale(): Locale {
  const saved = localStorage.getItem('language') as Locale | null;
  if (saved && availableLocales.some((l) => l.code === saved)) return saved;
  return 'en';
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, bn, es, fr },
});

// Keep <html lang> in sync for screen readers / spellcheck
watch(
  () => i18n.global.locale.value,
  (code) => {
    document.documentElement.lang = code;
  },
  { immediate: true }
);
