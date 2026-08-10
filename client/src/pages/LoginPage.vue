<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">💊</div>
      <h1>{{ $t('app.name') }}</h1>
      <p class="tagline">{{ $t('app.tagline') }}</p>

      <form @submit.prevent="handleSendOtp">
        <label>{{ $t('auth.phoneLabel') }}</label>
        <input
          v-model="phone"
          type="tel"
          :placeholder="$t('auth.phonePlaceholder')"
          required
          class="input"
        />
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? $t('common.loading') : $t('auth.sendOtp') }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const phone = ref('');
const loading = ref(false);
const error = ref('');

async function handleSendOtp() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(phone.value);
    router.push({ name: 'otp-verify', query: { phone: phone.value } });
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to send OTP';
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
.logo { font-size: 48px; margin-bottom: 16px; }
h1 { color: var(--color-primary); margin-bottom: 4px; }
.tagline { color: var(--color-text-muted); margin-bottom: 32px; }
label { display: block; text-align: left; margin-bottom: 6px; font-weight: 500; }
.input {
  width: 100%;
  padding: 12px 16px;
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
