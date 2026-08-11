<template>
  <AppLayout>
    <button @click="$router.back()" class="back-btn">← Back</button>

    <div v-if="loading" class="state"><div class="spinner"></div></div>

    <div v-else-if="doctor" class="profile">
      <!-- Header Card -->
      <div class="header-card">
        <div class="doc-avatar-lg">
          {{ (doctor.name || 'D')[0].toUpperCase() }}
        </div>
        <h1>{{ doctor.name }}</h1>
        <span class="badge-spec">{{ doctor.specialization }}</span>
        <span class="verified-badge" v-if="doctor.license_number">✓ Verified · Lic. {{ doctor.license_number }}</span>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-num">12+</span>
            <span class="stat-label">Years Exp.</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">৳{{ doctor.consultation_fee || 0 }}</span>
            <span class="stat-label">Per Visit</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ doctor.video_enabled ? '📹' : '📞' }}</span>
            <span class="stat-label">{{ doctor.video_enabled ? 'Video Call' : 'Phone Call' }}</span>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="section-card" v-if="doctor.bio">
        <h3>About</h3>
        <p>{{ doctor.bio }}</p>
      </div>

      <!-- Availability -->
      <div class="section-card" v-if="doctor.available_hours">
        <h3>Available Hours</h3>
        <div class="hours-grid">
          <div v-for="(time, day) in parsedHours" :key="day" class="hour-chip" :class="{ off: time === 'Off' }">
            <span class="day">{{ day }}</span>
            <span class="time">{{ time }}</span>
          </div>
        </div>
      </div>

      <!-- Book Appointment -->
      <div class="book-card">
        <h3>Book an Appointment</h3>
        <div class="book-form">
          <input v-model="scheduledDate" type="date" class="date-input" :min="today" />
          <select v-model="scheduledTime" class="time-select">
            <option value="">Select time</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
          </select>
          <textarea v-model="notes" placeholder="Reason for visit (optional)" rows="2"></textarea>
          <button @click="bookAppointment" :disabled="booking || !scheduledDate || !scheduledTime" class="btn-book">
            {{ booking ? 'Booking...' : 'Confirm Booking · ৳' + (doctor.consultation_fee || 0) }}
          </button>
          <p v-if="bookSuccess" class="success-msg">✓ Appointment booked! Check your appointments page.</p>
          <p v-if="bookError" class="error-msg">{{ bookError }}</p>
        </div>
      </div>
    </div>

    <div v-else class="state">Doctor not found</div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const route = useRoute();
const router = useRouter();
const api = useApi();
const doctor = ref<any>(null);
const loading = ref(true);
const booking = ref(false);
const bookSuccess = ref(false);
const bookError = ref('');
const scheduledDate = ref('');
const scheduledTime = ref('');
const notes = ref('');

const today = new Date().toISOString().slice(0, 10);

const parsedHours = computed(() => {
  try {
    const h = doctor.value?.available_hours;
    if (typeof h === 'string') return JSON.parse(h);
    return h || {};
  } catch { return {}; }
});

onMounted(async () => {
  try {
    const { data } = await api.get(`/doctors/${route.params.id}`);
    if (data.ok) doctor.value = data.data;
  } finally { loading.value = false; }
});

async function bookAppointment() {
  if (!scheduledDate.value || !scheduledTime.value) return;
  booking.value = true;
  bookError.value = '';
  bookSuccess.value = false;
  try {
    const datetime = `${scheduledDate.value}T${scheduledTime.value}:00+06:00`;
    const { data } = await api.post('/appointments', {
      doctorId: doctor.value.id,
      scheduledAt: datetime,
      notes: notes.value || undefined,
    });
    if (data.ok) {
      bookSuccess.value = true;
      scheduledDate.value = '';
      scheduledTime.value = '';
      notes.value = '';
      setTimeout(() => router.push('/appointments'), 1500);
    }
  } catch (e: any) {
    bookError.value = e.response?.data?.error || 'Booking failed';
  } finally { booking.value = false; }
}
</script>

<style scoped>
.back-btn { padding: 8px 0; background: none; color: var(--text-muted); font-size: 14px; font-weight: 500; margin-bottom: 16px; }
.back-btn:hover { color: var(--text); }
.state { text-align: center; padding: 60px; color: var(--text-muted); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.header-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 16px;
}
.doc-avatar-lg {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 30px;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(13,148,136,0.2);
}
.header-card h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.badge-spec {
  display: inline-block;
  padding: 4px 14px;
  background: var(--primary-bg);
  color: var(--primary);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}
.verified-badge { display: block; font-size: 12px; color: var(--success); font-weight: 600; margin-bottom: 20px; }
.stats-row { display: flex; align-items: center; justify-content: center; gap: 0; padding-top: 20px; border-top: 1px solid var(--border); }
.stat-item { flex: 1; text-align: center; }
.stat-num { display: block; font-size: 15px; font-weight: 700; color: var(--text); }
.stat-label { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.stat-divider { width: 1px; height: 32px; background: var(--border); }

.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
}
.section-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.section-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

.hours-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
.hour-chip {
  text-align: center;
  padding: 10px 8px;
  border-radius: 12px;
  background: var(--bg-secondary);
  font-size: 12px;
}
.hour-chip.off { opacity: 0.4; }
.hour-chip .day { display: block; font-weight: 600; margin-bottom: 2px; font-size: 11px; text-transform: uppercase; }
.hour-chip .time { display: block; color: var(--text-secondary); font-size: 11px; }

.book-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}
.book-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.book-form { display: flex; flex-direction: column; gap: 12px; }
.date-input, .time-select {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--bg);
  color: var(--text);
}
.date-input:focus, .time-select:focus { border-color: var(--primary); }
textarea {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--bg);
  color: var(--text);
  resize: vertical;
  font-family: inherit;
}
textarea:focus { border-color: var(--primary); outline: none; }
.btn-book {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  transition: transform 0.15s;
}
.btn-book:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-book:not(:disabled):hover { transform: scale(1.01); }
.success-msg { text-align: center; color: var(--success); font-size: 14px; margin-top: 8px; font-weight: 600; }
.error-msg { text-align: center; color: var(--danger); font-size: 13px; margin-top: 8px; }
</style>
