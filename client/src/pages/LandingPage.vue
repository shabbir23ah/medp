<template>
  <div class="page">
    <!-- Nav -->
    <nav class="nav" :class="{ scrolled: isScrolled }">
      <div class="nav-row">
        <a href="/" class="logo">MedPrescription</a>
        <div class="nav-end">
          <button class="lang-btn" @click="cycleLang">{{ currentLang }}</button>
          <router-link to="/login" class="signin-btn">Sign in</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-text">
          <p class="eyebrow">Your health, organized</p>
          <h1>Every prescription,<br><span class="accent">always with you.</span></h1>
          <p class="lead">Snap a photo of any prescription. We'll organize it, remind you when it's time for medicine, and keep your entire health history searchable — forever free.</p>
          <div class="hero-actions">
            <router-link to="/login" class="btn-primary">Get started free</router-link>
            <a href="#features" class="btn-ghost">See what it does ↓</a>
          </div>
          <ul class="trust-list">
            <li>No password needed</li>
            <li>Works on any device</li>
            <li>Free, always</li>
          </ul>
        </div>
        <div class="hero-visual">
          <div class="rx-stack">
            <div class="rx-card rx-1">
              <div class="rx-header">
                <span class="rx-rx">℞</span>
                <div>
                  <div class="rx-doctor">Dr. Sarah Chen</div>
                  <div class="rx-hospital">Downtown Medical</div>
                </div>
                <span class="rx-date">15 Jul</span>
              </div>
              <div class="rx-meds">
                <div class="rx-med">
                  <span class="med-name">Amoxicillin</span>
                  <span class="med-dose">500mg</span>
                </div>
                <div class="rx-med">
                  <span class="med-name">Ibuprofen</span>
                  <span class="med-dose">400mg</span>
                </div>
              </div>
              <div class="rx-footer">
                <span class="rx-freq">Twice daily · 7 days</span>
                <span class="rx-sig">─────</span>
              </div>
            </div>
            <div class="rx-card rx-2">
              <div class="rx-header">
                <span class="rx-rx">℞</span>
                <div>
                  <div class="rx-doctor">Dr. James Park</div>
                  <div class="rx-hospital">City Hospital</div>
                </div>
                <span class="rx-date">02 Jun</span>
              </div>
              <div class="rx-meds">
                <div class="rx-med">
                  <span class="med-name">Vitamin D</span>
                  <span class="med-dose">2000 IU</span>
                </div>
              </div>
              <div class="rx-footer">
                <span class="rx-freq">Once daily · Ongoing</span>
                <span class="rx-sig">─────</span>
              </div>
            </div>
            <div class="rx-card rx-3">
              <div class="rx-header">
                <span class="rx-rx">℞</span>
                <div>
                  <div class="rx-doctor">Dr. Maria Ruiz</div>
                  <div class="rx-hospital">Wellness Clinic</div>
                </div>
                <span class="rx-date">10 Jan</span>
              </div>
              <div class="rx-meds">
                <div class="rx-med">
                  <span class="med-name">Lisinopril</span>
                  <span class="med-dose">10mg</span>
                </div>
                <div class="rx-med">
                  <span class="med-name">Metformin</span>
                  <span class="med-dose">850mg</span>
                </div>
              </div>
              <div class="rx-footer">
                <span class="rx-freq">Once daily · Ongoing</span>
                <span class="rx-sig">─────</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats" id="features">
      <div class="stat-block">
        <div class="stat-item reveal">
          <p class="stat-number">∞</p>
          <p class="stat-label">Unlimited prescriptions</p>
        </div>
        <div class="stat-item reveal">
          <p class="stat-number">100%</p>
          <p class="stat-label">Free, no premium tier</p>
        </div>
        <div class="stat-item reveal">
          <p class="stat-number">4</p>
          <p class="stat-label">Languages supported</p>
        </div>
        <div class="stat-item reveal">
          <p class="stat-number">24/7</p>
          <p class="stat-label">Always accessible</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="section-head reveal">
        <span class="tag">Features</span>
        <h2>Everything your health deserves</h2>
      </div>
      <div class="feature-grid">
        <div class="feat-card reveal" v-for="(f, i) in featureCards" :key="i" :style="{ transitionDelay: (0.1 * i) + 's' }">
          <div class="feat-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how">
      <div class="section-head reveal">
        <span class="tag alt">How it works</span>
        <h2>Four steps to peace of mind</h2>
      </div>
      <div class="how-grid">
        <div class="how-card reveal" v-for="(s, i) in howSteps" :key="i" :style="{ transitionDelay: (0.15 * i) + 's' }">
          <div class="how-num">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="how-icon">{{ s.icon }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Preview -->
    <section class="preview">
      <div class="preview-grid">
        <div class="preview-text reveal">
          <span class="tag">See it in action</span>
          <h2>Your timeline,<br>beautifully arranged</h2>
          <p>Every prescription, lab report, and reminder lives in one searchable timeline. Find anything in seconds — by doctor, hospital, diagnosis, or medicine name.</p>
          <ul class="checklist">
            <li>Photo uploads in seconds</li>
            <li>Automatic date ordering</li>
            <li>Search by any keyword</li>
            <li>Reminders that work</li>
          </ul>
        </div>
        <div class="preview-mockup reveal">
          <div class="mockup-frame">
            <div class="mockup-bar"></div>
            <div class="mockup-content">
              <div class="mockup-row" v-for="i in 4" :key="i">
                <div class="mockup-dot" :class="'d' + i"></div>
                <div class="mockup-lines">
                  <div class="mockup-line"></div>
                  <div class="mockup-line w60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-inner reveal">
        <h2>Ready to take control?</h2>
        <p>Your health records, always with you. No ads, no fees, no nonsense.</p>
        <router-link to="/login" class="btn-primary large">Get started — it's free forever</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-row">
        <div class="footer-brand">
          <p class="footer-logo">MedPrescription</p>
          <p class="footer-desc">Your personal health companion. Store, search, and never forget.</p>
        </div>
        <div class="footer-col">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <router-link to="/login">Sign in</router-link>
          <a href="#">Privacy</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="#">Help center</a>
          <a href="#">Contact</a>
          <a href="#">FAQ</a>
        </div>
      </div>
      <p class="footer-copy">© 2026 MedPrescription. Made with care.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { availableLocales } from '../locales';

const { t, locale } = useI18n();

const isScrolled = ref(false);
function onScroll() { isScrolled.value = window.scrollY > 30; }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});

onUnmounted(() => window.removeEventListener('scroll', onScroll));

const currentLang = computed(() =>
  availableLocales.find(l => l.code === locale.value)?.nativeName || 'EN'
);

function cycleLang() {
  const idx = availableLocales.findIndex(l => l.code === locale.value);
  const next = availableLocales[(idx + 1) % availableLocales.length];
  locale.value = next.code;
  localStorage.setItem('language', next.code);
}

const featureCards = computed(() => [
  { icon: '📸', title: t('landing.feat1Title'), desc: t('landing.feat1Desc') },
  { icon: '📅', title: t('landing.feat2Title'), desc: t('landing.feat2Desc') },
  { icon: '⏰', title: t('landing.feat3Title'), desc: t('landing.feat3Desc') },
  { icon: '🔍', title: t('landing.feat4Title'), desc: t('landing.feat4Desc') },
  { icon: '🌐', title: t('landing.feat5Title'), desc: t('landing.feat5Desc') },
  { icon: '🔒', title: t('landing.feat6Title'), desc: t('landing.feat6Desc') },
]);

const howSteps = computed(() => [
  { icon: '📱', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
  { icon: '📤', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
  { icon: '📋', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
  { icon: '🔔', title: t('landing.step4Title'), desc: t('landing.step4Desc') },
]);
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono&display=swap');
</style>

<style scoped>
/* ── Design tokens ── */
.page {
  --ink: #1B3A4B;
  --ink-light: #3D5A6B;
  --coral: #D45D4D;
  --coral-glow: #E87A6C;
  --sage: #5B8C5A;
  --parchment: #F5F0EB;
  --surface: #FFFFFF;
  --slate: #8D99AE;
  --line: #E5DFD7;
  --line-light: #F0EBE4;
  --mono: 'Space Mono', monospace;
  --display: 'Cormorant Garamond', Georgia, serif;
  --body: 'DM Sans', -apple-system, sans-serif;

  font-family: var(--body);
  background: var(--parchment);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Nav ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  transition: background 0.4s, box-shadow 0.4s;
  padding: 6px 0;
}
.nav.scrolled {
  background: rgba(245,240,235,0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 1px 0 var(--line);
}
.nav-row {
  max-width: 1200px; margin: 0 auto; padding: 16px 28px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo {
  font-family: var(--display);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  letter-spacing: -0.3px;
}
.nav-end { display: flex; align-items: center; gap: 10px; }
.lang-btn {
  padding: 8px 14px; border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--surface);
  font-family: var(--body); font-size: 13px; font-weight: 500;
  color: var(--ink-light); cursor: pointer;
  transition: border-color 0.2s;
}
.lang-btn:hover { border-color: var(--coral); color: var(--coral); }
.signin-btn {
  padding: 9px 20px; border-radius: 6px;
  background: var(--coral); color: white;
  font-family: var(--body); font-size: 13px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.signin-btn:hover { background: var(--coral-glow); transform: translateY(-1px); }

/* ── Hero ── */
.hero {
  padding: 160px 28px 80px;
  max-width: 1200px; margin: 0 auto;
}
.hero-grid {
  display: grid; grid-template-columns: 1fr 460px;
  gap: 80px; align-items: center;
}
.hero-text { max-width: 520px; }
.eyebrow {
  font-family: var(--mono);
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 2.5px;
  color: var(--coral);
  margin-bottom: 20px;
}
.hero-text h1 {
  font-family: var(--display);
  font-size: clamp(42px, 5.5vw, 64px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -1px;
  margin-bottom: 24px;
}
.accent { color: var(--coral); font-style: italic; }
.lead {
  font-size: 16px; line-height: 1.7;
  color: var(--ink-light);
  margin-bottom: 32px;
  max-width: 440px;
}
.hero-actions {
  display: flex; gap: 14px; align-items: center;
  margin-bottom: 36px;
}
.btn-primary {
  display: inline-block;
  padding: 15px 30px; border-radius: 6px;
  background: var(--coral); color: white;
  font-family: var(--body); font-weight: 600; font-size: 15px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover { background: var(--coral-glow); transform: translateY(-1px); }
.btn-primary.large { padding: 18px 38px; font-size: 17px; }
.btn-ghost {
  padding: 15px 28px; border-radius: 6px;
  border: 1px solid var(--line);
  font-family: var(--body); font-size: 14px; font-weight: 500;
  color: var(--ink-light); text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.btn-ghost:hover { border-color: var(--coral); color: var(--coral); }
.trust-list {
  list-style: none; display: flex; gap: 24px;
  font-size: 13px; color: var(--slate);
}
.trust-list li::before { content: '✓ '; color: var(--sage); font-weight: 700; }

/* ── Hero visual: prescription stack ── */
.hero-visual {
  display: flex; justify-content: center; align-items: center;
  perspective: 800px;
}
.rx-stack {
  position: relative;
  width: 380px; height: 440px;
}
.rx-card {
  position: absolute; inset: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 28px 26px;
  display: flex; flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--body);
}
.rx-1 {
  transform: rotate(-2deg) translateY(4px);
  z-index: 3;
}
.rx-2 {
  transform: rotate(1.5deg) translateY(16px) translateX(-6px);
  z-index: 2;
  opacity: 0.85;
}
.rx-3 {
  transform: rotate(-0.5deg) translateY(28px) translateX(4px);
  z-index: 1;
  opacity: 0.6;
}
.rx-stack:hover .rx-1 { transform: rotate(-2deg) translateY(0px) translateX(-2px); }
.rx-stack:hover .rx-2 { transform: rotate(2deg) translateY(10px) translateX(-12px); }
.rx-stack:hover .rx-3 { transform: rotate(-1deg) translateY(22px) translateX(-8px); }
.rx-header {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 20px;
}
.rx-rx {
  font-family: var(--display);
  font-size: 28px; color: var(--coral); line-height: 1;
}
.rx-doctor {
  font-size: 15px; font-weight: 600; color: var(--ink);
}
.rx-hospital {
  font-size: 12px; color: var(--slate);
}
.rx-date {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 11px; color: var(--slate);
}
.rx-meds {
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 20px;
}
.rx-med {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line-light);
}
.rx-med:last-child { border-bottom: none; }
.med-name {
  font-size: 14px; font-weight: 600; color: var(--ink);
}
.med-dose {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 12px; color: var(--slate);
  background: var(--line-light);
  padding: 2px 8px; border-radius: 3px;
}
.rx-footer {
  display: flex; align-items: center; justify-content: space-between;
}
.rx-freq {
  font-size: 12px; color: var(--slate); font-style: italic;
}
.rx-sig {
  color: var(--slate); letter-spacing: -2px;
}

/* ── Stats ── */
.stats {
  padding: 32px 28px 64px;
  max-width: 1200px; margin: 0 auto;
}
.stat-block {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 4px; overflow: hidden;
}
.stat-item {
  background: var(--surface);
  padding: 32px 24px; text-align: center;
}
.stat-number {
  font-family: var(--mono);
  font-size: 32px; font-weight: 700;
  color: var(--coral);
  margin-bottom: 6px;
}
.stat-label {
  font-size: 13px; color: var(--slate);
}

/* ── Sections ── */
.section-head {
  text-align: center; margin-bottom: 64px;
}
.tag {
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--coral);
  margin-bottom: 16px;
}
.tag.alt { color: var(--sage); }
.section-head h2 {
  font-family: var(--display);
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 600;
  letter-spacing: -0.5px;
}

/* ── Features ── */
.features {
  padding: 40px 28px 80px;
  max-width: 1200px; margin: 0 auto;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 4px; overflow: hidden;
}
.feat-card {
  background: var(--surface);
  padding: 40px 32px;
  transition: background 0.25s;
}
.feat-card:hover { background: #FCFAF7; }
.feat-icon {
  font-size: 28px; margin-bottom: 16px;
}
.feat-card h3 {
  font-family: var(--display);
  font-size: 22px; font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.feat-card p {
  font-size: 14px; line-height: 1.65; color: var(--ink-light);
}

/* ── How ── */
.how {
  padding: 40px 28px 80px;
  max-width: 1200px; margin: 0 auto;
}
.how-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 4px; overflow: hidden;
}
.how-card {
  background: var(--surface);
  padding: 36px 28px;
  position: relative;
}
.how-num {
  font-family: var(--mono);
  font-size: 13px; color: var(--coral);
  margin-bottom: 16px;
}
.how-icon { font-size: 26px; margin-bottom: 14px; }
.how-card h3 {
  font-family: var(--display);
  font-size: 20px; font-weight: 600;
  margin-bottom: 8px;
}
.how-card p {
  font-size: 13px; line-height: 1.6; color: var(--ink-light);
}

/* ── Preview ── */
.preview {
  padding: 40px 28px 80px;
  max-width: 1200px; margin: 0 auto;
}
.preview-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
.preview-text h2 {
  font-family: var(--display);
  font-size: clamp(28px, 3.5vw, 38px);
  font-weight: 600;
  line-height: 1.15;
  margin: 16px 0 20px;
  letter-spacing: -0.5px;
}
.preview-text p {
  font-size: 15px; line-height: 1.65;
  color: var(--ink-light);
  margin-bottom: 24px;
}
.checklist {
  list-style: none;
  display: flex; flex-direction: column; gap: 10px;
}
.checklist li {
  font-size: 14px; color: var(--ink);
}
.checklist li::before {
  content: '✦ ';
  color: var(--coral);
}
.preview-mockup {
  display: flex; justify-content: center;
}
.mockup-frame {
  width: 320px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
}
.mockup-bar {
  height: 40px;
  background: var(--ink);
  display: flex; align-items: center; padding: 0 14px; gap: 6px;
}
.mockup-bar::before {
  content: '';
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  box-shadow: 16px 0 0 rgba(255,255,255,0.25), 32px 0 0 rgba(255,255,255,0.25);
}
.mockup-content {
  padding: 20px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.mockup-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: var(--parchment);
  border-radius: 4px;
}
.mockup-dot {
  width: 32px; height: 32px; border-radius: 3px; flex-shrink: 0;
}
.d1 { background: var(--coral); }
.d2 { background: var(--sage); }
.d3 { background: #4A90D9; }
.d4 { background: #E8A838; }
.mockup-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.mockup-line { height: 9px; background: #E5DFD7; border-radius: 3px; }
.w60 { width: 60%; }

/* ── CTA ── */
.cta {
  padding: 60px 28px 80px;
}
.cta-inner {
  max-width: 600px; margin: 0 auto; text-align: center;
}
.cta-inner h2 {
  font-family: var(--display);
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}
.cta-inner p {
  font-size: 16px; color: var(--ink-light);
  margin-bottom: 32px;
}

/* ── Footer ── */
.footer {
  padding: 64px 28px 32px;
  background: var(--surface);
  border-top: 1px solid var(--line);
}
.footer-row {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr;
  gap: 40px; margin-bottom: 40px;
}
.footer-logo {
  font-family: var(--display);
  font-size: 20px; font-weight: 600;
  margin-bottom: 8px;
}
.footer-desc {
  font-size: 13px; color: var(--slate);
  max-width: 280px; line-height: 1.6;
}
.footer-col h4 {
  font-family: var(--body);
  font-size: 13px; font-weight: 600;
  margin-bottom: 12px;
  color: var(--ink);
}
.footer-col a {
  display: block; font-size: 13px; color: var(--slate);
  padding: 4px 0; text-decoration: none;
  transition: color 0.2s;
}
.footer-col a:hover { color: var(--coral); }
.footer-copy {
  max-width: 1200px; margin: 0 auto;
  padding-top: 20px; border-top: 1px solid var(--line);
  font-size: 12px; color: var(--slate); text-align: center;
}

/* ── Scroll reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { display: none; }
  .hero { padding: 130px 20px 40px; }
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .how-grid { grid-template-columns: 1fr 1fr; }
  .preview-grid { grid-template-columns: 1fr; gap: 40px; }
  .preview-mockup { order: -1; }
  .stat-block { grid-template-columns: 1fr 1fr; }
  .trust-list { flex-wrap: wrap; gap: 12px 20px; }
  .footer-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 540px) {
  .feature-grid { grid-template-columns: 1fr; }
  .how-grid { grid-template-columns: 1fr; }
  .stat-block { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; }
  .btn-ghost { text-align: center; }
  .footer-row { grid-template-columns: 1fr; }
  .nav-row { padding: 14px 16px; }
  .logo { font-size: 18px; }
}
</style>
