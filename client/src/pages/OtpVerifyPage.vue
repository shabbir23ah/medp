<template>
  <div class="login-page">
    <div class="login-card">
      <h1>{{ $t('auth.otpLabel') }}</h1>
      <p class="tagline">{{ $t('auth.otpSent') }} <strong>{{ phone }}</strong></p>

      <form @submit.prevent="handleVerify">
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          :placeholder="$t('auth.otpPlaceholder')"
          required
          class="input code-input"
          autofocus
          :aria-label="$t('auth.otpLabel')"
        />
        <button type="submit" :disabled="loading || code.length !== 6" class="btn-primary">
          {{ loading ? $t('common.loading') : $t('auth.verify') }}
        </button>
      </form>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="resent && !error" class="success" role="status">{{ $t('auth.otpResent') }}</p>

      <button
        class="resend-btn"
        :disabled="cooldown > 0 || resending"
        @click="resendOtp"
      >
        {{ cooldown > 0 ? $t('auth.resendIn', { s: cooldown }) : (resending ? $t('common.loading') : $t('auth.resend')) }}
      </button>
      <router-link to="/login" class="change-number">{{ $t('auth.changeNumber') }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const auth = useAuthStore();

const phone = (route.query.phone as string) || '';
const mode = (route.query.mode as string) || '';
const code = ref('');
const loading = ref(false);
const error = ref('');

const RESEND_COOLDOWN = 60;
const cooldown = ref(RESEND_COOLDOWN);
const resending = ref(false);
const resent = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

function startCooldown() {
  cooldown.value = RESEND_COOLDOWN;
  stopCooldownTimer();
  timer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--;
    else stopCooldownTimer();
  }, 1000);
}

function stopCooldownTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

async function resendOtp() {
  if (cooldown.value > 0 || resending.value) return;
  error.value = '';
  resent.value = false;
  resending.value = true;
  try {
    await auth.login(phone);
    resent.value = true;
    startCooldown();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to send OTP';
  } finally {
    resending.value = false;
  }
}

async function handleVerify() {
  if (loading.value || code.value.length !== 6) return;
  error.value = '';
  loading.value = true;
  try {
    await auth.verifyOtp(phone, code.value, mode);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Verification failed';
  } finally {
    loading.value = false;
  }
}

// Auto-submit once all 6 digits are in (paste or fast typing)
watch(code, (val) => {
  if (val.length === 6 && !loading.value) handleVerify();
});

onMounted(startCooldown);
onUnmounted(stopCooldownTimer);
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.login-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h1 { color: var(--primary); margin-bottom: 4px; }
.tagline { color: var(--text-muted); margin-bottom: 32px; }
.code-input {
  width: 100%;
  padding: 14px 16px;
  text-align: center;
  font-size: 28px;
  letter-spacing: 12px;
}
.input {
  border: 2px solid var(--border);
  border-radius: 8px;
  margin-bottom: 16px;
  outline: none;
  font-size: 16px;
}
.input:focus { border-color: var(--primary); }
.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
}
.btn-primary:disabled { opacity: 0.6; }
.error { color: var(--danger); margin-top: 12px; }
.success { color: var(--success); margin-top: 12px; font-size: 14px; font-weight: 600; }
.resend-btn {
  margin-top: 20px;
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--primary-bg);
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s;
}
.resend-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.change-number {
  display: inline-block;
  margin-top: 14px;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: underline;
}
</style>
