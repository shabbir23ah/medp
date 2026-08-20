<template>
  <div class="mobile-nav" :class="{ hidden: isHidden, compact: isCompact }">
    <nav class="pill-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="active"
        exact
      >
        <component :is="item.icon" class="nav-icon" :size="isCompact ? 17 : 20" :stroke-width="2.2" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Home, Stethoscope, ShoppingCart, Calendar, ClipboardList, User, LayoutDashboard, AlarmClock, Pill } from 'lucide-vue-next';

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();

const isHidden = ref(false);
const isCompact = ref(false);
let lastScrollY = window.scrollY;
let ticking = false;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let showTimeout: ReturnType<typeof setTimeout> | null = null;

function resetNavState() {
  // On navigation: instantly show the nav and resync scroll anchor
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
  if (showTimeout) { clearTimeout(showTimeout); showTimeout = null; }
  isHidden.value = false;
  isCompact.value = false;
  lastScrollY = window.scrollY;
}

// Reset when navigating to a new page (prevents flicker from stale scroll state)
watch(() => route.path, () => {
  resetNavState();
});

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const delta = y - lastScrollY;

    // Compact (smaller) after scrolling a bit — smooth via CSS transition
    isCompact.value = y > 60;

    // iOS-like: only hide after sustained scroll down, restore instantly on scroll up
    if (delta > 5 && y > 140) {
      if (!isHidden.value) {
        // Small delay so micro-scrolls don't hide the bar
        hideTimeout = setTimeout(() => { isHidden.value = true; }, 60);
      }
    } else if (delta < -3 || y < 100) {
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
      if (isHidden.value) {
        showTimeout = setTimeout(() => { isHidden.value = false; }, 0);
      }
    }

    lastScrollY = y;
    ticking = false;
  });
}

onMounted(() => {
  lastScrollY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  if (hideTimeout) clearTimeout(hideTimeout);
  if (showTimeout) clearTimeout(showTimeout);
});

const items = computed(() => {
  if (auth.isDoctor) {
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/reminders', icon: AlarmClock, label: 'Reminders' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];
  }
  if (auth.user?.role === 'pharmacy') {
    return [
      { to: '/pharmacy', icon: Pill, label: 'Catalog' },
      { to: '/reminders', icon: AlarmClock, label: 'Reminders' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];
  }
  return [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/shop', icon: ShoppingCart, label: 'Shop' },
    { to: '/plans', icon: ClipboardList, label: 'Plans' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];
});
</script>

<style scoped>
.mobile-nav {
  display: block;
  position: fixed;
  bottom: 12px;
  left: 50%;
  z-index: 100;
  padding: 0 16px;
  width: 100%;
  max-width: 440px;
  /* iOS-style spring curve: smooth ease-out with slight overshoot feel */
  transition:
    transform 0.5s cubic-bezier(0.32, 0.72, 0.34, 1),
    opacity 0.45s cubic-bezier(0.32, 0.72, 0.34, 1);
  will-change: transform, opacity;
  transform: translateX(-50%);
}
.pill-nav {
  position: relative;
  display: flex;
  border-radius: 22px;
  padding: 4px;
  overflow: hidden;
  /* iOS frosted glass — layered translucent tint */
  background:
    linear-gradient(180deg, var(--dock-highlight) 0%, transparent 45%),
    var(--dock-bg);
  border: 1px solid var(--dock-border);
  box-shadow:
    inset 0 1px 0 var(--dock-inset),
    inset 0 0 0 0.5px rgba(255,255,255,0.04),
    0 12px 32px rgba(0,0,0,0.16),
    0 2px 8px rgba(0,0,0,0.08);
  /* Frosted blur — blurs what's behind the bar */
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  /* Smooth size changes */
  transition:
    padding 0.4s cubic-bezier(0.32, 0.72, 0.34, 1),
    border-radius 0.4s cubic-bezier(0.32, 0.72, 0.34, 1),
    box-shadow 0.4s ease;
}
/* Top sheen — the glossy highlight line like iOS dock */
.pill-nav::before {
  content: '';
  position: absolute;
  top: 0; left: 8%; right: 8%;
  height: 50%;
  border-radius: 22px 22px 40% 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
  z-index: 1;
}
.nav-item {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 16px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0.34, 1);
}
.nav-item.active {
  color: var(--primary);
  background: var(--primary-bg);
}
.nav-icon { line-height: 1; transition: all 0.4s cubic-bezier(0.32, 0.72, 0.34, 1); }
.nav-label { font-size: 10px; font-weight: 600; transition: all 0.4s cubic-bezier(0.32, 0.72, 0.34, 1); }

/* Compact: gracefully shrinks while scrolling */
.mobile-nav.compact .pill-nav { padding: 2px; border-radius: 16px; }
.mobile-nav.compact .nav-item { padding: 5px 4px; }
.mobile-nav.compact .nav-icon { font-size: 17px; }
.mobile-nav.compact .nav-label { font-size: 9px; opacity: 0.9; }

/* Hidden: glides down out of view, iOS-like */
.mobile-nav.hidden {
  transform: translateX(-50%) translateY(140%);
  opacity: 0;
  pointer-events: none;
}

@media (min-width: 768px) {
  .mobile-nav { display: none; }
}
</style>
