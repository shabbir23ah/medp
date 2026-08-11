import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '../composables/useApi';
import router from '../router';

interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  nid: string | null;
  dob: string | null;
  profilePic: string | null;
  language: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);
  const isProfileComplete = computed(() => !!user.value?.name);
  const isDoctor = computed(() => user.value?.role === 'doctor');
  const isPatient = computed(() => !user.value?.role || user.value.role === 'patient');

  function persist() {
    if (token.value) localStorage.setItem('token', token.value);
    else localStorage.removeItem('token');
    if (user.value) localStorage.setItem('user', JSON.stringify(user.value));
    else localStorage.removeItem('user');
  }

  async function login(phone: string) {
    const api = useApi();
    await api.post('/auth/send-otp', { phone });
  }

  async function verifyOtp(phone: string, code: string) {
    const api = useApi();
    const { data } = await api.post('/auth/verify-otp', { phone, code });
    if (data.ok) {
      token.value = data.data.token;
      user.value = data.data.user;
      persist();
      // Redirect to profile if new user
      if (data.data.isNew) {
        router.push('/profile');
      } else {
        router.push('/timeline');
      }
    }
    return data;
  }

  async function fetchProfile() {
    const api = useApi();
    const { data } = await api.get('/user/profile');
    if (data.ok) {
      user.value = data.data;
      persist();
    }
    return data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    persist();
    router.push('/login');
  }

  return { token, user, isAuthenticated, isProfileComplete, login, verifyOtp, fetchProfile, logout };
});
