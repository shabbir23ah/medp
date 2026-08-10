<template>
  <AppLayout :title="$t('nav.timeline')">
    <div v-if="store.loading && store.prescriptions.length === 0" class="center">
      {{ $t('common.loading') }}
    </div>

    <div v-else-if="store.prescriptions.length === 0" class="center empty">
      <p>📄</p>
      <p>{{ $t('prescription.noPrescriptions') }}</p>
    </div>

    <PrescriptionCard
      v-for="p in store.prescriptions"
      :key="p.id"
      :prescription="p"
    />

    <button
      v-if="store.prescriptions.length < store.total"
      @click="loadMore"
      class="btn-more"
    >
      {{ $t('common.loading') }}
    </button>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import PrescriptionCard from '../components/PrescriptionCard.vue';
import { usePrescriptionsStore } from '../stores/prescriptions';

const store = usePrescriptionsStore();

onMounted(() => store.fetchPrescriptions());

function loadMore() {
  store.fetchPrescriptions(store.page + 1);
}
</script>

<style scoped>
.center { text-align: center; padding: 40px 0; color: var(--color-text-muted); }
.empty p { margin-top: 8px; font-size: 16px; }
.btn-more {
  display: block;
  width: 100%;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-primary);
  margin-top: 12px;
}
</style>
