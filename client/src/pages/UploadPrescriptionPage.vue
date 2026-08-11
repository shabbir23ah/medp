<template>
  <AppLayout>
    <div class="page-hero">
      <h1>New Prescription</h1>
      <p>Upload a photo or enter the details manually.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <!-- Image Upload -->
      <div class="section-card">
        <h3>📸 Prescription Photo</h3>
        <FileUpload v-model="image" label="Tap to upload or drag & drop" />
      </div>

      <!-- Doctor & Location -->
      <div class="section-card">
        <h3>👨‍⚕️ Doctor Details</h3>
        <div class="field-row">
          <div class="field">
            <label>Doctor Name</label>
            <input v-model="form.doctor_name" placeholder="e.g. Dr. Sarah Chen" />
          </div>
          <div class="field">
            <label>Hospital / Clinic</label>
            <input v-model="form.hospital" placeholder="e.g. Dhaka Medical" />
          </div>
        </div>
        <div class="field">
          <label>Prescribed Date</label>
          <input v-model="form.prescribed_date" type="date" />
        </div>
      </div>

      <!-- Diagnosis -->
      <div class="section-card">
        <h3>🩺 Medical Details</h3>
        <div class="field">
          <label>Diagnosis</label>
          <textarea v-model="form.diagnosis" placeholder="What was diagnosed?" rows="2"></textarea>
        </div>
        <div class="field">
          <label>Notes</label>
          <textarea v-model="form.notes" placeholder="Any additional notes..." rows="2"></textarea>
        </div>
      </div>

      <!-- Medicines -->
      <div class="section-card">
        <div class="section-header-row">
          <h3>💊 Medicines</h3>
          <button type="button" @click="addMedicine" class="add-med-btn">+ Add</button>
        </div>

        <div v-if="medicines.length === 0" class="empty-meds">
          <p>No medicines added yet. Tap "+ Add" to include prescribed medicines.</p>
        </div>

        <div v-for="(med, i) in medicines" :key="i" class="med-block">
          <div class="med-header">
            <span class="med-num">Medicine {{ i + 1 }}</span>
            <button type="button" @click="removeMedicine(i)" class="remove-btn">✕</button>
          </div>
          <input v-model="med.name" placeholder="Medicine name" class="med-name-input" />
          <div class="med-grid">
            <input v-model="med.dosage" placeholder="Dosage" />
            <input v-model="med.frequency" placeholder="Frequency" />
            <input v-model="med.duration" placeholder="Duration" />
            <input v-model="med.timing" placeholder="Timing" />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button type="submit" :disabled="!image || submitting" class="btn-submit">
        {{ submitting ? 'Saving...' : 'Save Prescription' }}
      </button>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </form>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import FileUpload from '../components/FileUpload.vue';
import { usePrescriptionsStore } from '../stores/prescriptions';

const router = useRouter();
const store = usePrescriptionsStore();

const image = ref<File | null>(null);
const submitting = ref(false);
const error = ref('');

const form = reactive({
  doctor_name: '',
  hospital: '',
  prescribed_date: new Date().toISOString().slice(0, 10),
  diagnosis: '',
  notes: '',
});

interface Med { name: string; dosage: string; frequency: string; duration: string; timing: string; }
const medicines = ref<Med[]>([]);

function addMedicine() {
  medicines.value.push({ name: '', dosage: '', frequency: '', duration: '', timing: '' });
}

function removeMedicine(i: number) {
  medicines.value.splice(i, 1);
}

async function handleSubmit() {
  if (!image.value) return;
  submitting.value = true;
  error.value = '';

  const fd = new FormData();
  fd.append('image', image.value);
  fd.append('doctor_name', form.doctor_name);
  fd.append('hospital', form.hospital);
  fd.append('prescribed_date', form.prescribed_date);
  fd.append('diagnosis', form.diagnosis);
  fd.append('notes', form.notes);
  fd.append('medicines', JSON.stringify(
    medicines.value.filter(m => m.name).map(m => ({
      name: m.name,
      dosage: m.dosage || undefined,
      frequency: m.frequency || undefined,
      duration: m.duration || undefined,
      timing: m.timing || undefined,
    }))
  ));

  try {
    await store.uploadPrescription(fd);
    router.push('/timeline');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Upload failed';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 4px; }
.page-hero p { font-size: 14px; color: var(--text-muted); }

.form { display: flex; flex-direction: column; gap: 16px; }

.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
}
.section-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header-row h3 { margin-bottom: 0; }

.field { margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s;
}
.field input:focus, .field textarea:focus { border-color: var(--primary); outline: none; }
.field textarea { resize: vertical; font-family: inherit; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.add-med-btn {
  padding: 8px 16px;
  background: var(--primary-bg);
  color: var(--primary);
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  transition: transform 0.15s;
}
.add-med-btn:hover { transform: scale(1.03); }

.empty-meds {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}

.med-block {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
}
.med-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.med-num { font-size: 12px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }
.remove-btn { width: 28px; height: 28px; border-radius: 50%; background: var(--danger-bg); color: var(--danger); font-size: 13px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.med-name-input { margin-bottom: 10px; }
.med-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.med-grid input {
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  background: var(--surface);
  color: var(--text);
}
.med-grid input:focus { border-color: var(--primary); outline: none; }

.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--primary-text);
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.2px;
  box-shadow: 0 4px 20px rgba(13,148,136,0.25);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(13,148,136,0.35); }
.error-msg { text-align: center; color: var(--danger); font-size: 14px; font-weight: 600; }
</style>
