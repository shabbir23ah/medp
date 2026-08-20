<template>
  <div class="register-page">
    <div class="card">
      <h1>Create your account</h1>
      <p class="sub">Choose how you want to use MedPrescription</p>

      <!-- Step 1: Phone + OTP -->
      <div v-if="step === 1">
        <label>Phone Number</label>
        <input v-model="phone" type="tel" placeholder="+8801XXXXXXXXX" class="input" />
        <button @click="sendOtp" :disabled="sending" class="btn-primary">
          {{ sending ? 'Sending...' : 'Send OTP' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <!-- Step 2: Verify OTP -->
      <div v-if="step === 2">
        <label>Enter OTP</label>
        <input v-model="code" type="text" inputmode="numeric" maxlength="6" placeholder="123456" class="input code-input" />
        <button @click="verifyOtp" :disabled="verifying || code.length !== 6" class="btn-primary">
          {{ verifying ? 'Verifying...' : 'Verify' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

    <!-- Step 3: Choose Role -->
    <div v-if="step === 3">
      <label>I am a...</label>
      <div class="role-grid">
        <button
          v-for="r in roles"
          :key="r.value"
          :class="['role-card', { active: selectedRole === r.value }]"
          @click="selectedRole = r.value"
        >
          <span class="role-icon">{{ r.icon }}</span>
          <span class="role-name">{{ r.label }}</span>
        </button>
      </div>

      <!-- Doctor fields -->
      <div v-if="selectedRole === 'doctor'" class="extra-fields">
        <label>Full Name</label>
        <input v-model="name" class="input" placeholder="Dr. Your Name" />
        <label>Specialization</label>
        <input v-model="specialization" class="input" placeholder="e.g. Cardiologist" />
      </div>

      <!-- Patient fields -->
      <div v-if="selectedRole === 'patient'" class="extra-fields">
        <label>Full Name</label>
        <input v-model="name" class="input" placeholder="Your full name" />
      </div>

      <!-- Pharmacy fields -->
      <div v-if="selectedRole === 'pharmacy'" class="extra-fields">
        <label>Pharmacy Name</label>
        <input v-model="name" class="input" placeholder="e.g. MedPlus Pharmacy" />
      </div>

      <button @click="register" :disabled="!selectedRole || registering" class="btn-primary">
        {{ registering ? 'Creating...' : 'Create Account' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const api = useApi();

const step = ref(1);
const phone = ref((route.query.phone as string) || '');
const code = ref('');
const selectedRole = ref('');
const name = ref('');
const specialization = ref('');
const sending = ref(false);
const verifying = ref(false);
const registering = ref(false);
const error = ref('');
const verifiedToken = ref('');

// If phone is in query (redirected from login), start at step 3 and reuse verified token
onMounted(() => {
  if (phone.value) {
    step.value = 3;
    if (auth.token) verifiedToken.value = auth.token;
  }
});

const roles = [
  { value: 'patient', label: 'Patient', icon: '👤' },
  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
  { value: 'pharmacy', label: 'Pharmacy', icon: '🏪' },
];

async function sendOtp() {
  error.value = '';
  sending.value = true;
  try {
    await api.post('/auth/send-otp', { phone: phone.value });
    step.value = 2;
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to send OTP';
  } finally {
    sending.value = false;
  }
}

async function verifyOtp() {
  error.value = '';
  verifying.value = true;
  try {
    const { data } = await api.post('/auth/verify-otp', { phone: phone.value, code: code.value });
    if (data.ok) {
      // Save the session token — register will use it instead of re-consuming the OTP
      verifiedToken.value = data.data.token;
      step.value = 3;
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Invalid code';
  } finally {
    verifying.value = false;
  }
}

async function register() {
  error.value = '';
  registering.value = true;
  try {
    const payload: any = {
      phone: phone.value,
      role: selectedRole.value,
      name: name.value || undefined,
    };
    // Only send code if we don't have a verified token (login-redirect flow)
    if (!verifiedToken.value && code.value) {
      payload.code = code.value;
    }
    if (selectedRole.value === 'doctor') {
      payload.specialization = specialization.value || undefined;
    }

    const headers = verifiedToken.value ? { Authorization: `Bearer ${verifiedToken.value}` } : {};
    const { data } = await api.post('/auth/register', payload, { headers });
    if (data.ok) {
      auth.token = data.data.token;
      auth.user = data.data.user;
      const dest = selectedRole.value === 'doctor' ? '/dashboard' : selectedRole.value === 'pharmacy' ? '/pharmacy' : '/timeline';
      router.push(dest);
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Registration failed';
  } finally {
    registering.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 20px; background: var(--bg);
}
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; box-shadow: var(--shadow);
  padding: 40px 32px; width: 100%; max-width: 440px;
}
h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; color: var(--text); }
.sub { color: var(--text-muted); margin-bottom: 28px; }
label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 13px; color: var(--text-secondary); }
.input {
  width: 100%; padding: 12px; border: 1.5px solid var(--border);
  border-radius: 12px; font-size: 15px; outline: none; margin-bottom: 14px;
  background: var(--bg); color: var(--text);
}
.input:focus { border-color: var(--primary); }
.code-input { text-align: center; font-size: 24px; letter-spacing: 10px; }
.btn-primary {
  width: 100%; padding: 14px; background: var(--primary); color: var(--primary-text);
  border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.error { color: var(--danger); margin-top: 10px; font-size: 13px; }
.role-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.role-card {
  padding: 20px 12px; border: 2px solid var(--border); border-radius: 12px;
  background: var(--surface); cursor: pointer; text-align: center;
  transition: all 0.2s;
}
.role-card:hover { border-color: var(--primary); }
.role-card.active { border-color: var(--primary); background: var(--primary-bg); }
.role-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.role-name { font-weight: 600; color: var(--text); }
.extra-fields { margin-bottom: 16px; }
</style>
