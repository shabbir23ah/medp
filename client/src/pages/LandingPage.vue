<template>
  <div class="landing">
    <!-- Nav -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="brand">💊 MedPrescription</div>
        <div class="nav-actions">
          <button class="btn-lang" @click="cycleLang">{{ currentLang }}</button>
          <router-link to="/login" class="btn-nav">{{ $t('landing.signIn') }}</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🩺 {{ $t('landing.badge') }}</div>
        <h1>{{ $t('landing.heroTitle') }}</h1>
        <p class="hero-sub">{{ $t('landing.heroSub') }}</p>
        <div class="hero-cta">
          <router-link to="/login" class="btn-primary">{{ $t('landing.getStarted') }}</router-link>
          <a href="#features" class="btn-outline">{{ $t('landing.learnMore') }}</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">100%</span>
            <span class="stat-label">{{ $t('landing.statFree') }}</span>
          </div>
          <div class="stat">
            <span class="stat-num">🔒</span>
            <span class="stat-label">{{ $t('landing.statPrivate') }}</span>
          </div>
          <div class="stat">
            <span class="stat-num">24/7</span>
            <span class="stat-label">{{ $t('landing.statAccess') }}</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-phone">
          <div class="phone-screen">
            <div class="phone-card" v-for="i in 3" :key="i" :style="{ animationDelay: i * 0.15 + 's' }">
              <div class="phone-avatar"></div>
              <div class="phone-lines">
                <div class="phone-line"></div>
                <div class="phone-line short"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="section-header">
        <span class="section-tag">{{ $t('landing.featuresTag') }}</span>
        <h2>{{ $t('landing.featuresTitle') }}</h2>
        <p>{{ $t('landing.featuresSub') }}</p>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(feat, i) in features" :key="i">
          <div class="feature-icon">{{ feat.icon }}</div>
          <h3>{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how">
      <div class="section-header">
        <span class="section-tag">{{ $t('landing.howTag') }}</span>
        <h2>{{ $t('landing.howTitle') }}</h2>
      </div>
      <div class="steps">
        <div class="step" v-for="(step, i) in steps" :key="i">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-icon">{{ step.icon }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-card">
        <h2>{{ $t('landing.ctaTitle') }}</h2>
        <p>{{ $t('landing.ctaSub') }}</p>
        <router-link to="/login" class="btn-primary btn-lg">{{ $t('landing.ctaButton') }}</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">💊 MedPrescription</div>
        <div class="footer-links">
          <a href="#features">{{ $t('landing.featuresTag') }}</a>
          <router-link to="/login">{{ $t('landing.signIn') }}</router-link>
        </div>
        <p class="footer-copy">{{ $t('landing.footer') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { availableLocales, type Locale } from '../locales';

const { t, locale } = useI18n();

const currentLang = computed(() => {
  return availableLocales.find(l => l.code === locale.value)?.nativeName || 'English';
});

function cycleLang() {
  const idx = availableLocales.findIndex(l => l.code === locale.value);
  const next = availableLocales[(idx + 1) % availableLocales.length];
  locale.value = next.code;
  localStorage.setItem('language', next.code);
}

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
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  overflow-x: hidden;
}

/* Nav */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  font-size: 20px;
  font-weight: 700;
  color: #0891b2;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-lang {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-lang:hover { border-color: #0891b2; color: #0891b2; }
.btn-nav {
  padding: 10px 20px;
  border-radius: 10px;
  background: #0891b2;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-nav:hover { background: #0e7490; transform: translateY(-1px); }

/* Hero */
.hero {
  padding: 140px 24px 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 90vh;
}
.hero-content { flex: 1; max-width: 560px; }
.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  color: #0891b2;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
}
.hero-content h1 {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 40%, #0e7490 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 480px;
}
.hero-cta {
  display: flex;
  gap: 12px;
  margin-bottom: 48px;
}
.btn-primary {
  padding: 16px 32px;
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(8,145,178,0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(8,145,178,0.4);
}
.btn-lg { padding: 18px 40px; font-size: 18px; }
.btn-outline {
  padding: 16px 32px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
  color: #334155;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: #0891b2; color: #0891b2; }
.hero-stats {
  display: flex;
  gap: 32px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-num { font-size: 24px; font-weight: 800; color: #0f172a; }
.stat-label { font-size: 13px; color: #94a3b8; font-weight: 500; }

/* Hero Visual */
.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 440px;
}
.hero-phone {
  width: 260px;
  height: 520px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.15), 0 0 0 4px #334155;
  position: relative;
}
.phone-screen {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border-radius: 26px;
  padding: 40px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
.phone-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  animation: slideIn 0.5s ease both;
}
.phone-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  flex-shrink: 0;
}
.phone-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.phone-line {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  width: 100%;
}
.phone-line.short { width: 60%; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sections */
.section-header {
  text-align: center;
  margin-bottom: 56px;
}
.section-tag {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #059669;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.section-header h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  margin-bottom: 12px;
}
.section-header p {
  font-size: 17px;
  color: #64748b;
  max-width: 500px;
  margin: 0 auto;
}

/* Features Grid */
.features {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}
.feature-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s;
  border: 1px solid #f1f5f9;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  border-color: #e2e8f0;
}
.feature-icon {
  font-size: 36px;
  margin-bottom: 20px;
  display: inline-block;
  padding: 14px;
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  border-radius: 16px;
}
.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.feature-card p {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}

/* How It Works */
.how {
  padding: 80px 24px;
  background: linear-gradient(180deg, #fff 0%, #f0fdfa 100%);
}
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
.step {
  text-align: center;
  position: relative;
}
.step-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.step-icon { font-size: 28px; margin-bottom: 12px; }
.step h3 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.step p { font-size: 14px; color: #64748b; line-height: 1.5; }

/* CTA Section */
.cta-section {
  padding: 80px 24px;
}
.cta-card {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  border-radius: 28px;
  padding: 64px 40px;
  color: #fff;
}
.cta-card h2 {
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 800;
  margin-bottom: 12px;
}
.cta-card p {
  font-size: 17px;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.6;
}
.cta-card .btn-primary {
  background: #fff;
  color: #0891b2;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.cta-card .btn-primary:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

/* Footer */
.footer {
  padding: 40px 24px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-brand {
  font-size: 18px;
  font-weight: 700;
  color: #0891b2;
  margin-bottom: 16px;
}
.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}
.footer-links a {
  color: #64748b;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-links a:hover { color: #0891b2; }
.footer-copy {
  font-size: 13px;
  color: #94a3b8;
}

/* Mobile */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 120px 20px 40px;
    gap: 0;
    text-align: center;
    min-height: auto;
  }
  .hero-sub { margin-left: auto; margin-right: auto; }
  .hero-cta { justify-content: center; flex-wrap: wrap; }
  .hero-stats { justify-content: center; }
  .hero-visual { display: none; }
  .features { padding: 40px 16px; }
  .features-grid { grid-template-columns: 1fr; }
  .steps { grid-template-columns: 1fr 1fr; gap: 24px; }
  .cta-card { padding: 40px 24px; border-radius: 20px; }
}
@media (max-width: 480px) {
  .steps { grid-template-columns: 1fr; }
  .hero-cta { flex-direction: column; }
  .btn-outline { text-align: center; }
}
</style>
