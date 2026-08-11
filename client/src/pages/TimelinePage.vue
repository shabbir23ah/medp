<template>
  <AppLayout>
    <div class="header-row">
      <h1 class="page-title">Your Timeline</h1>
      <router-link to="/upload" class="add-btn">+ New</router-link>
    </div>

    <div v-if="store.loading && store.prescriptions.length === 0" class="state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else-if="store.prescriptions.length === 0" class="state">
      <div class="empty-icon">📋</div>
      <h2>No prescriptions yet</h2>
      <p>Upload your first prescription to start building your health timeline.</p>
      <router-link to="/upload" class="cta-btn">Upload Prescription</router-link>
    </div>

    <template v-else>
      <PrescriptionCard v-for="p in store.prescriptions" :key="p.id" :prescription="p" />
      <button v-if="store.prescriptions.length < store.total" @click="loadMore" class="load-more">
        Load older
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
onMounted(() => { store.fetchPrescriptions(); subscribeToPush(); });
function loadMore() { store.fetchPrescriptions(store.page + 1); }
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
.add-btn {
  padding: 10px 18px; background: var(--primary); color: var(--primary-text);
  border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;
  transition: transform 0.15s;
}
.add-btn:active { transform: scale(0.95); }
.state { text-align: center; padding: 80px 20px; }
.state h2 { font-size: 18px; margin: 12px 0 6px; }
.state p { font-size: 14px; color: var(--text-muted); max-width: 280px; margin: 0 auto 20px; }
.empty-icon { font-size: 56px; margin-bottom: 8px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.cta-btn { display: inline-block; padding: 14px 32px; background: var(--primary); color: var(--primary-text); border-radius: 14px; font-weight: 700; font-size: 15px; text-decoration: none; }
.load-more { display: block; width: 100%; padding: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; color: var(--primary); font-weight: 600; font-size: 14px; margin-top: 8px; }
</style>
