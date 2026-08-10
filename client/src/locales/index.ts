import { createI18n } from 'vue-i18n';
import en from './en.json';
import bn from './bn.json';
import es from './es.json';
import fr from './fr.json';

export type Locale = 'en' | 'bn' | 'es' | 'fr';

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, bn, es, fr },
});

export const availableLocales: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];
