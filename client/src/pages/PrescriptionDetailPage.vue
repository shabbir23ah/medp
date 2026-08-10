<template>
  <AppLayout :title="$t('prescription.upload')">
    <div v-if="loading" class="center">{{ $t('common.loading') }}</div>

    <div v-else-if="prescription" class="detail">
      <img :src="prescription.image_url" alt="Prescription" class="full-image" />

      <div class="meta">
        <div class="field" v-if="prescription.doctor_name">
          <span class="label">👨‍⚕️ Doctor</span>
          <span>{{ prescription.doctor_name }}</span>
        </div>
        <div class="field" v-if="prescription.hospital">
          <span class="label">🏥 Hospital</span>
          <span>{{ prescription.hospital }}</span>
        </div>
        <div class="field">
          <span class="label">📅 Date</span>
          <span>{{ prescription.prescribed_date }}</span>
        </div>
        <div class="field" v-if="prescription.diagnosis">
          <span class="label">🩺 Diagnosis</span>
          <span>{{ prescription.diagnosis }}</span>
        </div>
        <div class="field" v-if="prescription.notes">
          <span class="label">📝 Notes</span>
          <span>{{ prescription.notes }}</span>
        </div>
      </div>

      <div class="medicines-section" v-if="prescription.medicines?.length">
        <h3>💊 {{ $t('prescription.medicines') }}</h3>
        <div v-for="med in prescription.medicines" :key="med.id" class="medicine-item">
          <strong>{{ med.name }}</strong>
          <span v-if="med.dosage"> — {{ med.dosage }}</span>
          <div class="med-extra">
            <span v-if="med.frequency">{{ med.frequency }}</span>
            <span v-if="med.timing"> • {{ med.timing }}</span>
            <span v-if="med.duration"> • {{ med.duration }}</span>
          </div>
        </div>
      </div>

      <button @click="handleDelete" class="btn-danger">
        {{ $t('prescription.delete') }}
      </button>
    </div>

    <div v-else class="center">{{ $t('common.error') }}</div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { usePrescriptionsStore, type Prescription } from '../stores/prescriptions';

const route = useRoute();
const router = useRouter();
const store = usePrescriptionsStore();

const prescription = ref<Prescription | null>(null);
const loading = ref(true);

onMounted(async () => {
  prescription.value = await store.getPrescription(route.params.id as string);
  loading.value = false;
});

async function handleDelete() {
  if (confirm('Delete this prescription?')) {
    await store.deletePrescription(route.params.id as string);
    router.push('/timeline');
  }
}
</script>

<style scoped>
.center { text-align: center; padding: 40px 0; color: var(--color-text-muted); }
.full-image { width: 100%; border-radius: var(--radius); margin-bottom: 16px; }
.meta { background: var(--color-surface); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
.field { margin-bottom: 12px; }
.label { display: block; font-size: 12px; color: var(--color-text-muted); margin-bottom: 2px; text-transform: uppercase; }
.medicines-section { background: var(--color-surface); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
.medicines-section h3 { margin-bottom: 12px; }
.medicine-item { padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.medicine-item:last-child { border-bottom: none; }
.med-extra { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
.btn-danger { width: 100%; padding: 14px; background: var(--color-danger); color: white; border-radius: 8px; font-weight: 600; }
</style>
