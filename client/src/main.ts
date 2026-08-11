import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n } from './locales';
import { initNotifications } from './composables/useNotifications';
import { useTheme } from './composables/useTheme';
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');

// Init theme (applies data-theme attr)
useTheme();

initNotifications();
