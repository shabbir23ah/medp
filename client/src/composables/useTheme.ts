import { ref, watch } from 'vue';

const isDark = ref(localStorage.getItem('theme') === 'dark');

export function useTheme() {
  function apply() {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }

  function toggle() {
    isDark.value = !isDark.value;
    apply();
  }

  // Apply on init
  apply();

  return { isDark, toggle };
}
