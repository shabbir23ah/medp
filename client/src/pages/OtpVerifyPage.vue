<template>
  <div class="login-page">
    <div class="login-card">
      <h1>{{ $t('auth.otpLabel') }}</h1>
      <p class="tagline">{{ $t('auth.otpSent') }}</p>

      <form @submit.prevent="handleVerify">
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          :placeholder="$t('auth.otpPlaceholder')"
          required
          class="input code-input"
          autofocus
        />
        <button type="submit" :disabled="loading || code.length !== 6" class="btn-primary">
          {{ loading ? $t('common.loading') : $t('auth.verify') }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const auth = useAuthStore();

const phone = (route.query.phone as string) || '';
const code = ref('');
const loading = ref(false);
const error = ref('');

async function handleVerify() {
  if (code.value.length !== 6) return;
  error.value = '';
  loading.value = true;
  try {
    await auth.verifyOtp(phone, code.value);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Verification failed';
  } finally {
    loading.value = false;
  }
}
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
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h1 { color: var(--color-primary); margin-bottom: 4px; }
.tagline { color: var(--color-text-muted); margin-bottom: 32px; }
.code-input {
  width: 100%;
  padding: 14px 16px;
  text-align: center;
  font-size: 28px;
  letter-spacing: 12px;
}
.input {
  border: 2px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 16px;
  outline: none;
  font-size: 16px;
}
.input:focus { border-color: var(--color-primary); }
.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
}
.btn-primary:disabled { opacity: 0.6; }
.error { color: var(--color-danger); margin-top: 12px; }
</style>
