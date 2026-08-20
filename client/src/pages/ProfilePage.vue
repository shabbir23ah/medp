<template>
  <AppLayout>
    <h1 class="page-title">Profile</h1>
    <div class="avatar-section" @click="triggerPicUpload">
      <div class="avatar-lg">
        <img v-if="auth.user?.profilePic" :src="auth.user.profilePic" alt="" />
        <span v-else class="avatar-initial">{{ (auth.user?.name || 'U')[0].toUpperCase() }}</span>
        <div class="avatar-overlay"><Camera :size="14" :stroke-width="2" class="inline-icon" /></div>
      </div>
      <p class="hint">Tap to change photo</p>
      <input ref="picInput" type="file" accept="image/*" hidden @change="handlePicChange" />
    </div>

    <div class="card">
      <div class="card-row">
        <span class="label">Phone</span>
        <span class="value">{{ auth.user?.phone }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="card">
      <div class="field">
        <label>Full Name</label>
        <input v-model="form.name" placeholder="Your full name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Optional" />
      </div>
      <div class="field">
        <label>National ID</label>
        <input v-model="form.nid" placeholder="NID number" />
      </div>
      <div class="field">
        <label>Date of Birth</label>
        <input v-model="form.dob" type="date" />
      </div>
      <button type="submit" :disabled="saving" class="btn-primary">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
      <p v-if="success" class="success">✓ Profile updated</p>
    </form>

    <button @click="auth.logout" class="btn-logout">Sign Out</button>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';
import { Camera } from 'lucide-vue-next';
const auth = useAuthStore();
const api = useApi();
const form = reactive({ name: auth.user?.name || '', email: auth.user?.email || '', nid: auth.user?.nid || '', dob: auth.user?.dob || '' });
const saving = ref(false);
const success = ref(false);
const picInput = ref<HTMLInputElement>();
function triggerPicUpload() { picInput.value?.click(); }
async function handlePicChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const fd = new FormData(); fd.append('picture', file);
  const { data } = await api.put('/user/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  if (data.ok) auth.user = data.data;
}
async function handleSave() {
  saving.value = true; success.value = false;
  try {
    // Send null for empty optional fields so zod .nullable() passes
    const payload: any = { name: form.name };
    payload.email = form.email || null;
    payload.nid = form.nid || null;
    payload.dob = form.dob || null;
    const { data } = await api.put('/user/profile', payload);
    if (data.ok) {
      auth.user = { ...auth.user, ...data.data };
      success.value = true;
      setTimeout(() => success.value = false, 3000);
    }
  } catch (e: any) {
    success.value = false;
    alert(e.response?.data?.error || 'Failed to save');
  }
  finally { saving.value = false; }
}
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 800; margin-bottom: 20px; }
.avatar-section { text-align: center; margin-bottom: 24px; }
.avatar-lg { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); margin: 0 auto; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initial { color: var(--primary-text); font-size: 32px; font-weight: 700; }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; opacity: 0; transition: opacity 0.2s; }
.avatar-lg:hover .avatar-overlay { opacity: 1; }
.hint { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; margin-bottom: 14px; }
.card-row { display: flex; justify-content: space-between; align-items: center; }
.label { font-size: 13px; color: var(--text-muted); }
.value { font-size: 14px; font-weight: 600; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.field input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}
.field input[type="date"] {
  min-height: 48px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg);
  color: var(--text);
}
.btn-primary { width: 100%; padding: 14px; background: var(--primary); color: var(--primary-text); border-radius: 14px; font-weight: 700; font-size: 15px; transition: transform 0.15s; }
.btn-primary:disabled { opacity: 0.5; }
.btn-primary:active { transform: scale(0.97); }
.success { text-align: center; color: var(--success); font-size: 13px; margin-top: 12px; font-weight: 600; }
.btn-logout { width: 100%; padding: 12px; border: 1.5px solid var(--danger); color: var(--danger); border-radius: 14px; font-weight: 600; font-size: 14px; }
.inline-icon { display: inline-block; vertical-align: -2px; }
</style>
