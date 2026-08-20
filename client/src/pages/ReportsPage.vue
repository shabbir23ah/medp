<template>
  <AppLayout :title="$t('nav.reports')">
    <!-- Upload form -->
    <form @submit.prevent="handleSubmit" class="upload-form">
      <FileUpload v-model="image" :label="$t('report.image')" />
      <input v-model="form.report_type" :placeholder="$t('report.type')" class="input" />
      <input v-model="form.lab_name" :placeholder="$t('report.lab')" class="input" />
      <input v-model="form.report_date" type="date" class="input" />
      <textarea v-model="form.notes" :placeholder="$t('report.notes')" class="input" rows="2"></textarea>
      <button type="submit" :disabled="!image || submitting" class="btn-primary">
        {{ submitting ? $t('common.loading') : $t('report.submit') }}
      </button>
    </form>

    <!-- List -->
    <div v-if="store.reports.length === 0 && !store.loading" class="center">
      <p>{{ $t('report.noReports') }}</p>
    </div>

    <ReportCard
      v-for="r in store.reports"
      :key="r.id"
      :report="r"
      @view="viewReport"
      @delete="handleDelete"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import FileUpload from '../components/FileUpload.vue';
import ReportCard from '../components/ReportCard.vue';
import { useReportsStore, type Report } from '../stores/reports';

const store = useReportsStore();
onMounted(() => store.fetchReports());

const image = ref<File | null>(null);
const submitting = ref(false);

const form = reactive({
  report_type: '',
  lab_name: '',
  report_date: '',
  notes: '',
});

async function handleSubmit() {
  if (!image.value) return;
  submitting.value = true;
  const fd = new FormData();
  fd.append('image', image.value);
  Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
  try {
    await store.uploadReport(fd);
    image.value = null;
    form.report_type = '';
    form.lab_name = '';
    form.report_date = '';
    form.notes = '';
  } finally { submitting.value = false; }
}

function viewReport(report: Report) {
  window.open(report.image_url, '_blank');
}

async function handleDelete(id: string) {
  if (confirm('Delete this report?')) await store.deleteReport(id);
}
</script>

<style scoped>
.upload-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.input { padding: 10px 14px; border: 2px solid var(--border); border-radius: 8px; outline: none; font-size: 15px; }
.input:focus { border-color: var(--primary); }
.btn-primary { padding: 14px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; }
.btn-primary:disabled { opacity: 0.5; }
.center { text-align: center; padding: 32px 0; color: var(--text-muted); }
</style>
