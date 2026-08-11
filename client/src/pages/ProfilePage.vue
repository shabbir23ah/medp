<template>
  <AppLayout>
    <div class="page-header">
      <h1>Profile</h1>
    </div>

    <div class="avatar-section" @click="triggerPicUpload">
      <div class="avatar-lg">
        <img v-if="auth.user?.profilePic" :src="auth.user.profilePic" alt="" />
        <span v-else class="avatar-placeholder">{{ (auth.user?.name || 'U')[0].toUpperCase() }}</span>
        <div class="avatar-overlay">📷</div>
      </div>
      <p class="avatar-hint">Tap to change photo</p>
      <input ref="picInput" type="file" accept="image/*" hidden @change="handlePicChange" />
    </div>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Phone</span>
        <span class="info-value">{{ auth.user?.phone }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="form-card">
      <div class="field">
        <label>Full Name</label>
        <input v-model="form.name" class="input" placeholder="Your full name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" class="input" placeholder="Optional" />
      </div>
      <div class="field">
        <label>National ID</label>
        <input v-model="form.nid" class="input" placeholder="NID number" />
      </div>
      <div class="field">
        <label>Date of Birth</label>
        <input v-model="form.dob" type="date" class="input" />
      </div>
      <button type="submit" :disabled="saving" class="btn-save">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
      <p v-if="success" class="success-msg">✓ Profile updated</p>
    </form>

    <button @click="auth.logout" class="btn-logout">Sign Out</button>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';

const auth = useAuthStore();
const api = useApi();

const form = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  nid: auth.user?.nid || '',
  dob: auth.user?.dob || '',
});

const saving = ref(false);
const success = ref(false);
const picInput = ref<HTMLInputElement>();

function triggerPicUpload() { picInput.value?.click(); }

async function handlePicChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('picture', file);
  const { data } = await api.put('/user/profile/picture', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (data.ok) auth.user = data.data;
}

async function handleSave() {
  saving.value = true;
  success.value = false;
  try {
    const { data } = await api.put('/user/profile', form);
    if (data.ok) {
      auth.user = data.data;
      success.value = true;
      setTimeout(() => (success.value = false), 3000);
    }
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; }
.avatar-section { text-align: center; margin-bottom: 24px; }
.avatar-lg {
  width: 88px; height: 88px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  margin: 0 auto; position: relative; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { color: white; font-size: 32px; font-weight: 700; }
.avatar-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.4); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; opacity: 0; transition: opacity 0.2s;
}
.avatar-lg:hover .avatar-overlay { opacity: 1; }
.avatar-hint { font-size: 12px; color: var(--color-text-muted); margin-top: 8px; }
.info-card {
  background: var(--color-surface);
  border-radius: var(--radius); padding: 16px;
  border: 1px solid var(--color-border);
  margin-bottom: 16px;
}
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: 13px; color: var(--color-text-muted); }
.info-value { font-size: 14px; font-weight: 600; }
.form-card {
  background: var(--color-surface);
  border-radius: var(--radius); padding: 20px;
  border: 1px solid var(--color-border);
}
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px; }
.input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-size: 15px; outline: none;
  background: var(--color-bg);
  transition: border-color 0.2s;
}
.input:focus { border-color: var(--color-primary); background: var(--color-surface); }
.btn-save {
  width: 100%; padding: 14px;
  background: var(--color-primary); color: white;
  border-radius: var(--radius-xs); font-weight: 600; font-size: 15px;
}
.btn-save:disabled { opacity: 0.5; }
.success-msg { text-align: center; color: var(--color-success); font-size: 13px; margin-top: 12px; font-weight: 600; }
.btn-logout {
  width: 100%; margin-top: 16px; padding: 12px;
  background: none; border: 1.5px solid var(--color-danger);
  color: var(--color-danger); border-radius: var(--radius-xs);
  font-weight: 600; font-size: 14px;
}
</style>
