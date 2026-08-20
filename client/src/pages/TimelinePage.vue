<template>
  <AppLayout>
    <div class="page-hero">
      <h1>Your Health Timeline</h1>
      <p>Every prescription, report, and record — chronologically organized.</p>
      <router-link to="/upload" class="fab">+ New Prescription</router-link>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.prescriptions.length === 0" class="state">
      <div class="spinner"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="store.prescriptions.length === 0" class="empty-state">
      <div class="empty-art"><ClipboardList :size="14" :stroke-width="2" class="inline-icon" /></div>
      <h2>Your timeline is empty</h2>
      <p>Upload your first prescription and start building your complete health history.</p>
      <router-link to="/upload" class="cta-btn">Upload First Prescription</router-link>
    </div>

    <!-- List -->
    <template v-else>
      <div class="timeline-divider">
        <span>{{ store.total }} records</span>
      </div>

      <PrescriptionCard
        v-for="(p, i) in store.prescriptions"
        :key="p.id"
        :prescription="p"
        :style="{ animationDelay: (i * 0.06) + 's' }"
        class="card-anim"
      />

      <button v-if="store.prescriptions.length < store.total" @click="loadMore" class="load-more">
        Show older records
      </button>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import PrescriptionCard from '../components/PrescriptionCard.vue';
import { usePrescriptionsStore } from '../stores/prescriptions';
import { subscribeToPush } from '../composables/useNotifications';
import { ClipboardList } from 'lucide-vue-next';

const store = usePrescriptionsStore();
onMounted(() => { store.fetchPrescriptions(); subscribeToPush(); });
function loadMore() { store.fetchPrescriptions(store.page + 1); }
</script>

<style scoped>
.page-hero {
  margin-bottom: 28px;
  position: relative;
}
.page-hero h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  margin-bottom: 6px;
}
.page-hero p {
  font-size: 14px;
  color: var(--text-muted);
}
.fab {
  position: absolute;
  top: 0;
  right: 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13,148,136,0.25);
  transition: transform 0.15s, box-shadow 0.15s;
}
.fab:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(13,148,136,0.35); }
.timeline-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.timeline-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
.timeline-divider span {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.state { text-align: center; padding: 80px 20px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state {
  text-align: center;
  padding: 60px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
}
.empty-art { font-size: 64px; margin-bottom: 16px; }
.empty-state h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.empty-state p { font-size: 14px; color: var(--text-muted); max-width: 320px; margin: 0 auto 24px; line-height: 1.5; }
.cta-btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--primary);
  color: var(--primary-text);
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: transform 0.15s;
}
.cta-btn:hover { transform: scale(1.02); }
.card-anim {
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.load-more {
  display: block;
  width: 100%;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
  margin-top: 12px;
  transition: background 0.15s;
}
.load-more:hover { background: var(--bg-secondary); }
.inline-icon { display: inline-block; vertical-align: -2px; }
</style>
