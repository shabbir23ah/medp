<template>
  <div class="landing">
    <!-- Background orbs -->
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
    <div class="bg-grid"></div>

    <!-- Nav -->
    <nav class="nav" :class="{ scrolled: isScrolled }">
      <div class="nav-inner">
        <div class="brand">
          <span class="brand-icon">💊</span>
          <span class="brand-text">MedPrescription</span>
        </div>
        <div class="nav-actions">
          <button class="btn-lang" @click="cycleLang">
            <span class="lang-globe">🌐</span>
            <span class="lang-label">{{ currentLang }}</span>
          </button>
          <router-link to="/login" class="btn-signin">Sign In</router-link>
          <router-link to="/register" class="btn-signup">Sign Up</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero" ref="heroRef">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            {{ $t('landing.badge') }}
          </div>
          <h1 class="hero-title">
            <span class="title-line">{{ $t('landing.heroTitleLine1') }}</span>
            <span class="title-highlight">{{ $t('landing.heroTitleLine2') }}</span>
          </h1>
          <p class="hero-sub">{{ $t('landing.heroSub') }}</p>
          <div class="hero-cta">
            <router-link to="/register" class="btn-primary">
              <span>Get Started Free</span>
              <span class="btn-arrow">→</span>
            </router-link>
            <router-link to="/login" class="btn-outline">
              Sign In
            </router-link>
          </div>
          <div class="hero-trust">
            <div class="trust-item" v-for="t in trustItems" :key="t.label">
              <span class="trust-check">✓</span>
              <span>{{ t.label }}</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-phone">
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <div class="app-header">
                  <div class="app-avatar">👤</div>
                  <div class="app-title">My Prescriptions</div>
                </div>
                <div class="app-card" v-for="(card, i) in demoCards" :key="i" :style="{ animationDelay: i * 0.2 + 's' }">
                  <div class="card-thumb" :class="'grad-' + (i + 1)"></div>
                  <div class="card-info">
                    <div class="card-line"></div>
                    <div class="card-line short"></div>
                    <div class="card-line xshort"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="float-badge badge-reminder">
              <span>⏰</span> Medicine reminder!
            </div>
            <div class="float-badge badge-upload">
              <span>📸</span> Prescription saved
            </div>
            <div class="float-badge badge-search">
              <span>🔍</span> Found 3 records
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,100 L0,100 Z" fill="currentColor"/>
        </svg>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats reveal">
      <div class="stats-inner">
        <div class="stat-card reveal reveal-delay-1" v-for="s in statsItems" :key="s.label">
          <span class="stat-icon">{{ s.icon }}</span>
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="section-header reveal">
        <span class="section-tag">{{ $t('landing.featuresTag') }}</span>
        <h2>{{ $t('landing.featuresTitle') }}</h2>
        <p>{{ $t('landing.featuresSub') }}</p>
      </div>
      <div class="features-grid">
        <div class="feature-card reveal reveal-delay-1" v-for="(feat, i) in features" :key="i" :style="{ transitionDelay: (0.1 * (i + 1)) + 's' }">
          <div class="feature-blur"></div>
          <div class="feature-icon-wrap">
            <span class="feature-icon">{{ feat.icon }}</span>
          </div>
          <h3>{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how">
      <div class="how-bg"></div>
      <div class="section-header reveal">
        <span class="section-tag dark">{{ $t('landing.howTag') }}</span>
        <h2>{{ $t('landing.howTitle') }}</h2>
      </div>
      <div class="steps">
        <div class="step-line"></div>
        <div class="step reveal" v-for="(step, i) in steps" :key="i" :style="{ transitionDelay: (0.15 * i) + 's' }">
          <div class="step-num-wrap">
            <div class="step-num">{{ i + 1 }}</div>
          </div>
          <div class="step-content">
            <div class="step-icon-circle">{{ step.icon }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo -->
    <section class="demo">
      <div class="demo-inner">
        <div class="demo-content reveal">
          <span class="section-tag">{{ $t('landing.demoTag') }}</span>
          <h2>{{ $t('landing.demoTitle') }}</h2>
          <p>{{ $t('landing.demoSub') }}</p>
          <ul class="demo-list">
            <li v-for="item in demoItems" :key="item">
              <span class="demo-check">✦</span> {{ item }}
            </li>
          </ul>
        </div>
        <div class="demo-visual reveal reveal-delay-2">
          <div class="demo-mockup">
            <div class="demo-header"></div>
            <div class="demo-body">
              <div class="demo-row" v-for="i in 4" :key="i">
                <div class="demo-dot" :class="'c' + i"></div>
                <div class="demo-text">
                  <div class="demo-line"></div>
                  <div class="demo-line short"></div>
                </div>
                <div class="demo-date"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-card">
        <div class="cta-glow"></div>
        <div class="cta-content">
          <span class="cta-icon">🚀</span>
          <h2>{{ $t('landing.ctaTitle') }}</h2>
          <p>{{ $t('landing.ctaSub') }}</p>
          <router-link to="/login" class="btn-primary btn-lg">
            {{ $t('landing.ctaButton') }}
            <span class="btn-arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="footer-logo">💊 MedPrescription</div>
            <p>{{ $t('landing.footerDesc') }}</p>
          </div>
          <div class="footer-col">
            <h4>{{ $t('landing.footerProduct') }}</h4>
            <a href="#features">{{ $t('landing.featuresTag') }}</a>
            <a href="#how">{{ $t('landing.howTag') }}</a>
            <router-link to="/login">{{ $t('landing.signIn') }}</router-link>
          </div>
          <div class="footer-col">
            <h4>{{ $t('landing.footerSupport') }}</h4>
            <a href="#">help@medprescription.app</a>
            <a href="#">FAQ</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>{{ $t('landing.footer') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { availableLocales } from '../locales';

const { t, locale } = useI18n();

const isScrolled = ref(false);

function onScroll() {
  isScrolled.value = window.scrollY > 20;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Scroll-reveal observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const currentLang = computed(() => {
  return availableLocales.find(l => l.code === locale.value)?.nativeName || 'English';
});

function cycleLang() {
  const idx = availableLocales.findIndex(l => l.code === locale.value);
  const next = availableLocales[(idx + 1) % availableLocales.length];
  locale.value = next.code;
  localStorage.setItem('language', next.code);
}

const trustItems = computed(() => [
  { label: t('landing.trust1') },
  { label: t('landing.trust2') },
  { label: t('landing.trust3') },
]);

const statsItems = computed(() => [
  { icon: '📄', value: '∞', label: t('landing.statPrescriptions') },
  { icon: '⏰', value: '100%', label: t('landing.statReminders') },
  { icon: '🌍', value: '4', label: t('landing.statLanguages') },
  { icon: '🔒', value: 'AES', label: t('landing.statEncryption') },
]);

const demoCards = Array.from({ length: 3 }, (_, i) => i);

const features = computed(() => [
  { icon: '📸', title: t('landing.feat1Title'), desc: t('landing.feat1Desc') },
  { icon: '📅', title: t('landing.feat2Title'), desc: t('landing.feat2Desc') },
  { icon: '⏰', title: t('landing.feat3Title'), desc: t('landing.feat3Desc') },
  { icon: '🔍', title: t('landing.feat4Title'), desc: t('landing.feat4Desc') },
  { icon: '🌐', title: t('landing.feat5Title'), desc: t('landing.feat5Desc') },
  { icon: '🔒', title: t('landing.feat6Title'), desc: t('landing.feat6Desc') },
]);

const steps = computed(() => [
  { icon: '📱', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
  { icon: '📤', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
  { icon: '📋', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
  { icon: '🔔', title: t('landing.step4Title'), desc: t('landing.step4Desc') },
]);

const demoItems = computed(() => [
  t('landing.demoItem1'),
  t('landing.demoItem2'),
  t('landing.demoItem3'),
  t('landing.demoItem4'),
]);
</script>

<style>
/* Global resets for this page only */
.landing * { box-sizing: border-box; }
.landing button { cursor: pointer; border: none; font-family: inherit; }
.landing a { text-decoration: none; color: inherit; }
@keyframes float1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(30px,-30px) rotate(120deg); } 66% { transform: translate(-20px,20px) rotate(240deg); } }
@keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,20px) scale(1.1); } }
@keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-40px); } }
@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeSlide { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }

/* Scroll reveal utility */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
</style>

<style scoped>
.landing {
  --c-primary: #0891b2;
  --c-primary-dark: #0e7490;
  --c-accent: #06b6d4;
  --c-bg: #fafbfc;
  --c-surface: #ffffff;
  --c-text: #0f172a;
  --c-muted: #64748b;
  --c-border: #e2e8f0;
  --c-green: #10b981;
  --c-purple: #8b5cf6;
  --c-amber: #f59e0b;
  --c-rose: #f43f5e;
  --radius: 16px;
  --radius-sm: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);

  min-height: 100vh;
  background: var(--c-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--c-text);
  overflow-x: hidden;
  position: relative;
}

/* Background orbs */
.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}
.orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, var(--c-accent), transparent);
  top: -200px; left: -200px;
  animation: float1 20s ease-in-out infinite;
}
.orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, var(--c-purple), transparent);
  bottom: -150px; right: -150px;
  animation: float2 25s ease-in-out infinite;
}
.orb-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--c-green), transparent);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 8s ease-in-out infinite;
}
.bg-grid {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 4px 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav.scrolled {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  padding: 2px 0;
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 28px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px;
}
.nav.scrolled .nav-inner { padding: 10px 28px; }
.brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: var(--c-text); flex-shrink: 0; }
.brand-icon { font-size: 28px; }
.nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.btn-lang {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 13px; border-radius: 10px;
  background: var(--c-surface); border: 1.5px solid var(--c-border);
  font-size: 13px; font-weight: 500; color: var(--c-muted);
  transition: all 0.2s; white-space: nowrap;
}
.btn-lang:hover { border-color: var(--c-primary); color: var(--c-primary); background: rgba(8,145,178,0.03); }
.lang-globe { font-size: 14px; }
.lang-label { max-width: 60px; overflow: hidden; text-overflow: ellipsis; }
.btn-signin {
  padding: 10px 22px; border-radius: 12px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  color: #fff; font-weight: 600; font-size: 14px;
  transition: all 0.3s; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(8,145,178,0.25);
}
.btn-signin:hover { 
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(8,145,178,0.4);
}
.btn-signup {
  padding: 10px 22px; border-radius: 12px;
  background: transparent;
  color: var(--primary);
  font-weight: 600; font-size: 14px;
  transition: all 0.3s; white-space: nowrap;
  border: 2px solid var(--primary);
  text-decoration: none;
}
.btn-signup:hover { 
  background: var(--primary);
  color: white;
}

/* Hero */
.hero {
  position: relative; z-index: 1;
  padding: 160px 24px 120px;
  background: linear-gradient(180deg, #f0fdfa 0%, var(--c-bg) 100%);
  overflow: hidden;
}
.hero-bg-shapes { position: absolute; inset: 0; pointer-events: none; }
.shape {
  position: absolute; border-radius: 50%;
  opacity: 0.08;
}
.shape-1 {
  width: 300px; height: 300px; background: var(--c-primary);
  top: 10%; right: 15%;
  animation: float3 12s ease-in-out infinite;
}
.shape-2 {
  width: 200px; height: 200px; background: var(--c-purple);
  bottom: 20%; left: 10%;
  animation: float2 18s ease-in-out infinite reverse;
}
.shape-3 {
  width: 150px; height: 150px; background: var(--c-amber);
  top: 30%; left: 5%;
  animation: float3 15s ease-in-out infinite;
}
.shape-4 {
  width: 100px; height: 100px; background: var(--c-green);
  top: 5%; left: 50%;
  animation: pulse 6s ease-in-out infinite;
}
.hero-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: 60px;
  position: relative; z-index: 1;
}
.hero-content { flex: 1; max-width: 560px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 18px; border-radius: 24px;
  background: rgba(8,145,178,0.08);
  border: 1px solid rgba(8,145,178,0.15);
  color: var(--c-primary-dark);
  font-size: 13px; font-weight: 600;
  margin-bottom: 28px;
  animation: fadeSlide 0.6s ease both;
}
.badge-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--c-primary);
  animation: pulse 2s ease-in-out infinite;
}
.hero-title {
  font-size: clamp(38px, 5.5vw, 60px);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  animation: fadeSlide 0.6s ease 0.1s both;
}
.title-line { display: block; color: var(--c-text); }
.title-highlight {
  display: block;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 50%, var(--c-purple) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: 17px; color: var(--c-muted); line-height: 1.7;
  margin-bottom: 32px; max-width: 460px;
  animation: fadeSlide 0.6s ease 0.2s both;
}
.hero-cta {
  display: flex; gap: 14px; margin-bottom: 32px;
  animation: fadeSlide 0.6s ease 0.3s both;
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 32px; border-radius: 14px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  color: #fff; font-weight: 700; font-size: 16px;
  box-shadow: 0 4px 20px rgba(8,145,178,0.35);
  transition: all 0.3s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(8,145,178,0.45); }
.btn-arrow { transition: transform 0.3s; }
.btn-primary:hover .btn-arrow { transform: translateX(4px); }
.btn-lg { padding: 18px 40px; font-size: 18px; }
.btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 16px 28px; border-radius: 14px;
  background: var(--c-surface); border: 2px solid var(--c-border);
  font-weight: 600; font-size: 15px; color: var(--c-text);
  transition: all 0.2s;
}
.btn-outline:hover { border-color: var(--c-primary); color: var(--c-primary); }
.hero-trust {
  display: flex; flex-wrap: wrap; gap: 16px 24px;
  animation: fadeSlide 0.6s ease 0.4s both;
}
.trust-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--c-muted); font-weight: 500;
}
.trust-check {
  width: 18px; height: 18px; border-radius: 50%;
  background: linear-gradient(135deg, var(--c-green), #34d399);
  color: #fff; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Hero Visual - Floating Phone */
.hero-visual { flex: 1; display: flex; justify-content: center; position: relative; max-width: 480px; }
.floating-phone { 
  position: relative;
  animation: phoneFloat 6s ease-in-out infinite;
}
@keyframes phoneFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
}
.phone-frame {
  width: 260px; height: 520px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  border-radius: 36px; padding: 10px;
  box-shadow: 
    0 30px 60px rgba(0,0,0,0.2), 
    0 0 0 3px #334155,
    inset 0 0 0 1px rgba(255,255,255,0.05);
  position: relative;
}
.phone-notch {
  width: 80px; height: 24px;
  background: #0f172a;
  border-radius: 0 0 16px 16px;
  position: absolute; top: 10px; left: 50%;
  transform: translateX(-50%); z-index: 2;
}
.phone-screen {
  width: 100%; height: 100%;
  background: #f8fafc;
  border-radius: 28px;
  padding: 48px 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
  overflow: hidden;
}
.app-header {
  display: flex; align-items: center; gap: 10px;
  padding: 0 4px; margin-bottom: 4px;
}
.app-avatar {
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}
.app-title { font-size: 14px; font-weight: 700; color: #1e293b; }
.app-card {
  background: #fff; border-radius: 12px; padding: 10px;
  display: flex; gap: 10px; align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  animation: cardSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.app-card:nth-child(2) { animation-delay: 0.15s; }
.app-card:nth-child(3) { animation-delay: 0.3s; }
.app-card:nth-child(4) { animation-delay: 0.45s; }
@keyframes cardSlideIn {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
.card-thumb {
  width: 40px; height: 44px; border-radius: 8px; flex-shrink: 0;
  position: relative; overflow: hidden;
}
.card-thumb::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
}
.grad-1 { background: linear-gradient(135deg, #0891b2, #06b6d4); }
.grad-2 { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.grad-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.card-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.card-line { height: 7px; background: #e2e8f0; border-radius: 4px; width: 100%; }
.card-line.short { width: 65%; }
.card-line.xshort { width: 40%; }

/* Floating badges */
.float-badge {
  position: absolute;
  padding: 9px 15px; border-radius: 14px;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  white-space: nowrap;
  display: flex; align-items: center; gap: 6px;
  background: #fff;
  pointer-events: none;
}
.badge-reminder {
  top: 50px; right: -90px;
  color: var(--c-rose);
  animation: badgeFloat 4s ease-in-out 0s infinite;
}
.badge-upload {
  bottom: 100px; left: -100px;
  color: var(--c-green);
  animation: badgeFloat 4s ease-in-out 1.3s infinite;
}
.badge-search {
  top: 45%; right: -75px;
  color: var(--c-purple);
  animation: badgeFloat 4s ease-in-out 2.6s infinite;
}
@keyframes badgeFloat {
  0%, 100% { transform: translateY(0px); opacity: 1; }
  50% { transform: translateY(-10px); opacity: 0.85; }
}

.hero-wave {
  position: absolute; bottom: 0; left: 0; right: 0;
  color: var(--c-bg); line-height: 0;
}
.hero-wave svg { width: 100%; height: 60px; }

/* Stats */
.stats { position: relative; z-index: 1; padding: 0 24px; margin-top: -1px; }
.stats-inner {
  max-width: 1000px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.stat-card {
  background: var(--c-surface); border-radius: var(--radius);
  padding: 28px 20px; text-align: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
  border: 1px solid var(--c-border);
}
.stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.stat-icon { font-size: 28px; display: block; margin-bottom: 10px; }
.stat-value {
  display: block; font-size: 28px; font-weight: 800;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label { display: block; font-size: 13px; color: var(--c-muted); margin-top: 4px; font-weight: 500; }

/* Features */
.features { position: relative; z-index: 1; padding: 100px 24px; }
.section-header { text-align: center; margin-bottom: 64px; }
.section-tag {
  display: inline-block; padding: 6px 16px; border-radius: 20px;
  background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15);
  color: var(--c-green); font-size: 13px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;
}
.section-tag.dark {
  background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.15);
  color: var(--c-purple);
}
.section-header h2 {
  font-size: clamp(28px, 4.5vw, 42px); font-weight: 800;
  margin-bottom: 12px; letter-spacing: -0.5px;
}
.section-header p {
  font-size: 17px; color: var(--c-muted); max-width: 540px; margin: 0 auto; line-height: 1.6;
}
.features-grid {
  max-width: 1100px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}
.feature-card {
  position: relative; overflow: hidden;
  background: var(--c-surface); border-radius: var(--radius);
  padding: 36px 28px;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow);
  transition: all 0.35s;
}
.feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: transparent; }
.feature-blur {
  position: absolute; top: -40px; right: -40px;
  width: 120px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(8,145,178,0.06), transparent);
  transition: all 0.5s;
}
.feature-card:hover .feature-blur { width: 180px; height: 180px; }
.feature-icon-wrap {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(8,145,178,0.08), rgba(6,182,212,0.08));
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.feature-icon { font-size: 26px; }
.feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.feature-card p { font-size: 14px; color: var(--c-muted); line-height: 1.65; }

/* How It Works */
.how {
  position: relative; z-index: 1;
  padding: 100px 24px;
  background: linear-gradient(180deg, var(--c-bg) 0%, #f8fafc 50%, var(--c-bg) 100%);
  overflow: hidden;
}
.how-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%);
  pointer-events: none;
}
.steps {
  max-width: 800px; margin: 0 auto;
  position: relative;
}
.step-line {
  position: absolute; left: 35px; top: 60px; bottom: 60px;
  width: 2px;
  background: linear-gradient(180deg, var(--c-primary), var(--c-purple), var(--c-green));
  border-radius: 1px;
}
.step {
  display: flex; gap: 28px; position: relative;
  padding: 24px 0;
}
.step-num-wrap { position: relative; z-index: 1; flex-shrink: 0; }
.step-num {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--c-surface); border: 2px solid var(--c-border);
  color: var(--c-text); font-weight: 800; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow);
}
.step-content {
  background: var(--c-surface); border-radius: var(--radius);
  padding: 24px 28px; flex: 1;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow);
}
.step-icon-circle {
  font-size: 24px; margin-bottom: 8px;
}
.step-content h3 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.step-content p { font-size: 14px; color: var(--c-muted); line-height: 1.6; }

/* Demo */
.demo { position: relative; z-index: 1; padding: 100px 24px; }
.demo-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; gap: 60px;
}
.demo-content { flex: 1; }
.demo-content h2 {
  font-size: clamp(28px, 4vw, 38px); font-weight: 800;
  margin: 12px 0; letter-spacing: -0.5px;
}
.demo-content p {
  font-size: 16px; color: var(--c-muted); line-height: 1.6; margin-bottom: 24px;
}
.demo-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
.demo-list li {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; color: var(--c-text);
}
.demo-check { color: var(--c-primary); font-size: 16px; }
.demo-visual { flex: 1; max-width: 440px; }
.demo-mockup {
  background: var(--c-surface); border-radius: 20px;
  border: 1px solid var(--c-border); box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.demo-header {
  height: 44px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  display: flex; align-items: center; padding: 0 16px; gap: 6px;
}
.demo-header::before {
  content: ''; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4);
  box-shadow: 16px 0 0 rgba(255,255,255,0.4), 32px 0 0 rgba(255,255,255,0.4);
}
.demo-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.demo-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
.demo-dot { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
.c1 { background: linear-gradient(135deg, #0891b2, #06b6d4); }
.c2 { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.c3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.c4 { background: linear-gradient(135deg, #10b981, #34d399); }
.demo-text { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.demo-line { height: 10px; background: #e2e8f0; border-radius: 5px; width: 100%; }
.demo-line.short { width: 60%; }
.demo-date { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; }

/* CTA */
.cta-section { position: relative; z-index: 1; padding: 80px 24px; }
.cta-card {
  max-width: 800px; margin: 0 auto; position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 28px; padding: 72px 48px; text-align: center;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.2);
}
.cta-glow {
  position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 200px;
  background: radial-gradient(ellipse, rgba(8,145,178,0.3) 0%, transparent 70%);
  pointer-events: none;
}
.cta-content { position: relative; z-index: 1; }
.cta-icon { font-size: 48px; display: block; margin-bottom: 20px; }
.cta-card h2 {
  font-size: clamp(28px, 4vw, 40px); font-weight: 800;
  color: #fff; margin-bottom: 12px;
}
.cta-card p {
  font-size: 17px; color: rgba(255,255,255,0.7); margin-bottom: 36px;
  max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;
}
.cta-card .btn-primary {
  background: linear-gradient(135deg, var(--c-accent), var(--c-primary));
  box-shadow: 0 4px 24px rgba(8,145,178,0.5);
  font-size: 17px;
}
.cta-card .btn-primary:hover { box-shadow: 0 8px 36px rgba(8,145,178,0.6); }

/* Footer */
.footer {
  position: relative; z-index: 1;
  padding: 64px 24px 32px;
  background: var(--c-surface); border-top: 1px solid var(--c-border);
}
.footer-inner { max-width: 1100px; margin: 0 auto; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-logo { font-size: 20px; font-weight: 700; color: var(--c-primary); margin-bottom: 12px; }
.brand-col p { font-size: 14px; color: var(--c-muted); line-height: 1.7; max-width: 300px; }
.footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: var(--c-text); }
.footer-col a {
  display: block; font-size: 14px; color: var(--c-muted);
  padding: 5px 0; transition: color 0.2s;
}
.footer-col a:hover { color: var(--c-primary); }
.footer-bottom {
  padding-top: 24px; border-top: 1px solid var(--c-border);
  text-align: center;
}
.footer-bottom p { font-size: 13px; color: #94a3b8; }

/* Responsive */
@media (max-width: 900px) {
  .hero-inner { flex-direction: column; text-align: center; }
  .hero-content { max-width: 100%; }
  .hero-sub { margin-left: auto; margin-right: auto; }
  .hero-cta { justify-content: center; }
  .hero-trust { justify-content: center; }
  .hero-visual { display: none; }
  .demo-inner { flex-direction: column; text-align: center; }
  .demo-list li { justify-content: center; }
  .demo-visual { max-width: 100%; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .hero { padding: 130px 16px 60px; }
  .hero-cta { flex-direction: column; }
  .hero-trust { flex-direction: column; gap: 10px; }
  .features-grid { grid-template-columns: 1fr; }
  .stats-inner { grid-template-columns: 1fr; }
  .step-line { left: 23px; }
  .step { gap: 16px; }
  .step-num { width: 36px; height: 36px; font-size: 15px; }
  .cta-card { padding: 48px 24px; border-radius: 20px; }
  .footer-grid { grid-template-columns: 1fr; gap: 24px; }
  .brand-text { display: none; }
  .float-badge { display: none; }
  .shape-1, .shape-2, .shape-3, .shape-4 { display: none; }
}
</style>
