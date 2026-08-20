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

        <div class="rating-display" v-if="rating.count > 0">
          <span class="big-stars">★★★★★</span>
          <span class="big-rating">{{ rating.avg.toFixed(1) }}</span>
          <span class="rating-count">· {{ rating.count }} review{{ rating.count > 1 ? 's' : '' }}</span>
        </div>

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
            <span class="stat-num"><component :is="doctor.video_enabled ? Video : Phone" :size="16" :stroke-width="2" /></span>
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

      <!-- Reviews -->
      <div class="section-card">
        <h3><Star :size="16" :stroke-width="2" class="inline-icon" /> Patient Reviews ({{ rating.count }})</h3>
        <div v-if="reviews.length === 0" class="no-reviews">No reviews yet. Be the first to review this doctor.</div>
        <div v-for="r in reviews" :key="r.id" class="review-item">
          <div class="review-head">
            <strong>{{ r.patient_name || 'Patient' }}</strong>
            <span class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
          </div>
          <p v-if="r.comment" class="review-comment">{{ r.comment }}</p>
          <span class="review-date">{{ fmtDate(r.created_at) }}</span>
        </div>

        <!-- Write review (patient only) -->
        <div class="write-review" v-if="!auth.isDoctor">
          <h4>Rate this doctor</h4>
          <div class="star-picker">
            <button v-for="n in 5" :key="n" @click="myRating = n" class="star-btn" :class="{ on: n <= myRating }">★</button>
          </div>
          <textarea v-model="myComment" placeholder="Share your experience (optional)" rows="2"></textarea>
          <button @click="submitReview" :disabled="submitting || myRating === 0" class="btn-submit-review">
            {{ submitting ? 'Submitting...' : 'Submit Review' }}
          </button>
          <p v-if="reviewDone" class="success">✓ Review submitted!</p>
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
import { Video, Phone, Star } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const api = useApi();
const auth = useAuthStore();
const doctor = ref<any>(null);
const loading = ref(true);
const booking = ref(false);
const bookSuccess = ref(false);
const bookError = ref('');
const scheduledDate = ref('');
const scheduledTime = ref('');
const notes = ref('');
const reviews = ref<any[]>([]);
const rating = ref({ avg: 0, count: 0 });
const myRating = ref(0);
const myComment = ref('');
const submitting = ref(false);
const reviewDone = ref(false);

const today = new Date().toISOString().slice(0, 10);

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const parsedHours = computed(() => {
  try {
    const h = doctor.value?.available_hours;
    if (typeof h === 'string') return JSON.parse(h);
    return h || {};
  } catch { return {}; }
});

onMounted(async () => {
  try {
    // Load doctor + reviews in parallel for speed
    const [docRes, revRes] = await Promise.all([
      api.get(`/doctors/${route.params.id}`),
      api.get(`/enhancements/doctors/${route.params.id}/reviews`).catch(() => null),
    ]);
    if (docRes.data.ok) doctor.value = docRes.data.data;
    if (revRes?.data?.ok) {
      reviews.value = revRes.data.data.reviews;
      rating.value = revRes.data.data.rating;
    }
  } finally { loading.value = false; }
});

async function submitReview() {
  if (myRating.value === 0) return;
  submitting.value = true;
  try {
    await api.post(`/enhancements/doctors/${route.params.id}/reviews`, {
      rating: myRating.value,
      comment: myComment.value || undefined,
    });
    reviewDone.value = true;
    const r = await api.get(`/enhancements/doctors/${route.params.id}/reviews`);
    if (r.data.ok) {
      reviews.value = r.data.data.reviews;
      rating.value = r.data.data.rating;
    }
  } finally { submitting.value = false; }
}

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
.verified-badge { display: block; font-size: 12px; color: var(--success); font-weight: 600; margin-bottom: 12px; }
.rating-display { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 16px; }
.big-stars { color: var(--warning); font-size: 18px; letter-spacing: 2px; }
.big-rating { font-size: 16px; font-weight: 800; }
.rating-count { font-size: 12px; color: var(--text-muted); }
.review-item { padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.review-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
.review-stars { color: var(--warning); font-size: 13px; }
.review-comment { font-size: 13px; color: var(--text-secondary); }
.review-date { font-size: 11px; color: var(--text-muted); }
.no-reviews { font-size: 13px; color: var(--text-muted); padding: 12px 0; }
.write-review { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.write-review h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.star-picker { display: flex; gap: 4px; margin-bottom: 10px; }
.star-btn { font-size: 24px; color: var(--border); transition: color 0.15s; }
.star-btn.on { color: var(--warning); }
.write-review textarea {
  width: 100%; padding: 10px; border: 1.5px solid var(--border); border-radius: 10px;
  font-size: 13px; background: var(--bg); color: var(--text); resize: vertical; font-family: inherit;
}
.write-review textarea:focus { border-color: var(--primary); outline: none; }
.btn-submit-review {
  margin-top: 8px; width: 100%; padding: 10px;
  background: var(--primary); color: var(--primary-text); border-radius: 10px; font-weight: 700; font-size: 13px;
}
.btn-submit-review:disabled { opacity: 0.5; }
.success { color: var(--success); font-size: 13px; font-weight: 600; margin-top: 8px; text-align: center; }
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
.inline-icon { display: inline-block; vertical-align: -2px; }
</style>
