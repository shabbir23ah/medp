<template>
  <AppLayout :title="$t('profile.title')">
    <div class="profile-pic-section" @click="triggerPicUpload">
      <img v-if="auth.user?.profilePic" :src="auth.user.profilePic" class="avatar" />
      <div v-else class="avatar-placeholder">👤</div>
      <span class="change-text">{{ $t('profile.picture') }}</span>
      <input ref="picInput" type="file" accept="image/*" hidden @change="handlePicChange" />
    </div>

    <form @submit.prevent="handleSave" class="form">
      <label>{{ $t('profile.name') }}</label>
      <input v-model="form.name" class="input" />

      <label>{{ $t('profile.email') }}</label>
      <input v-model="form.email" type="email" class="input" />

      <label>{{ $t('profile.nid') }}</label>
      <input v-model="form.nid" class="input" />

      <label>{{ $t('profile.dob') }}</label>
      <input v-model="form.dob" type="date" class="input" />

      <button type="submit" :disabled="saving" class="btn-primary">
        {{ saving ? $t('common.loading') : $t('profile.save') }}
      </button>
    </form>

    <p v-if="success" class="success">{{ $t('profile.saved') }}</p>

    <button @click="auth.logout" class="btn-logout">{{ $t('auth.logout') }}</button>
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
      setTimeout(() => success.value = false, 3000);
    }
  } finally { saving.value = false; }
}
</script>

<style scoped>
.profile-pic-section { text-align: center; margin-bottom: 24px; cursor: pointer; }
.avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; background: var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto; }
.change-text { display: block; color: var(--color-primary); font-size: 13px; margin-top: 6px; }
.form { display: flex; flex-direction: column; gap: 12px; }
label { font-weight: 500; font-size: 14px; }
.input { padding: 10px 14px; border: 2px solid var(--color-border); border-radius: 8px; outline: none; font-size: 15px; }
.input:focus { border-color: var(--color-primary); }
.btn-primary { padding: 14px; background: var(--color-primary); color: white; border-radius: 8px; font-weight: 600; }
.btn-primary:disabled { opacity: 0.5; }
.success { color: #059669; text-align: center; margin-top: 12px; }
.btn-logout { width: 100%; padding: 12px; margin-top: 20px; background: none; border: 1px solid var(--color-danger); color: var(--color-danger); border-radius: 8px; }
</style>
