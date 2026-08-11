<template>
  <AppLayout>
    <div class="timeline-header">
      <h1>Your Timeline</h1>
      <router-link to="/upload" class="add-btn">+ New</router-link>
    </div>

    <div v-if="store.loading && store.prescriptions.length === 0" class="state">
      <div class="spinner"></div>
      <p>Loading your prescriptions...</p>
    </div>

    <div v-else-if="store.prescriptions.length === 0" class="state">
      <div class="empty-icon">📋</div>
      <h2>No prescriptions yet</h2>
      <p>Upload your first prescription to start building your health timeline.</p>
      <router-link to="/upload" class="cta-btn">Upload Prescription</router-link>
    </div>

    <template v-else>
      <div class="timeline-connector"></div>
      <PrescriptionCard
        v-for="(p, i) in store.prescriptions"
        :key="p.id"
        :prescription="p"
        :style="{ animationDelay: (i * 0.05) + 's' }"
        class="card-anim"
      />

      <button
        v-if="store.prescriptions.length < store.total"
        @click="loadMore"
        class="load-more"
      >
        Load older prescriptions
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

const store = usePrescriptionsStore();

onMounted(() => {
  store.fetchPrescriptions();
  subscribeToPush();
});

function loadMore() {
  store.fetchPrescriptions(store.page + 1);
}
</script>

<style scoped>
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.timeline-header h1 {
  font-size: 22px;
  font-weight: 700;
}
.add-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
.state {
  text-align: center;
  padding: 60px 20px;
}
.state h2 { font-size: 18px; margin: 12px 0 6px; }
.state p { font-size: 14px; color: var(--color-text-muted); max-width: 280px; margin: 0 auto 20px; }
.empty-icon { font-size: 48px; margin-bottom: 8px; }
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.cta-btn {
  display: inline-block;
  padding: 12px 28px;
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}
.card-anim {
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.load-more {
  display: block;
  width: 100%;
  padding: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
}
</style>
