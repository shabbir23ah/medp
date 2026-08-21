<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">💊</div>
      <h1>Welcome back</h1>
      <p class="tagline">Sign in to your Wellness account</p>

      <form @submit.prevent="handleSendOtp">
        <label>Phone Number</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="+8801XXXXXXXXX"
          required
          class="input"
        />
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Sending OTP...' : 'Send OTP' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="switch">
        Don't have an account?
        <router-link to="/register">Create one →</router-link>
      </p>
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
    router.push({ name: 'otp-verify', query: { phone: phone.value, mode: 'login' } });
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
  padding: 24px;
  background: var(--bg);
}
.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.logo { font-size: 48px; margin-bottom: 16px; }
h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.tagline { color: var(--text-muted); font-size: 14px; margin-bottom: 32px; }
label { display: block; text-align: left; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-secondary); }
.input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  background: var(--bg);
}
.input:focus { border-color: var(--primary); }
.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: var(--primary-text);
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  transition: transform 0.15s;
}
.btn-primary:disabled { opacity: 0.5; }
.btn-primary:not(:disabled):active { transform: scale(0.97); }
.error { color: var(--danger); margin-top: 12px; font-size: 13px; }
.switch { margin-top: 24px; font-size: 14px; color: var(--text-muted); }
.switch a { color: var(--primary); font-weight: 600; }
</style>
