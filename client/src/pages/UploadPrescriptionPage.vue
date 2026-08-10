<template>
  <AppLayout :title="$t('prescription.upload')">
    <form @submit.prevent="handleSubmit" class="form">
      <FileUpload v-model="image" :label="$t('prescription.image')" />

      <label>{{ $t('prescription.doctor') }}</label>
      <input v-model="form.doctor_name" class="input" />

      <label>{{ $t('prescription.hospital') }}</label>
      <input v-model="form.hospital" class="input" />

      <label>{{ $t('prescription.date') }}</label>
      <input v-model="form.prescribed_date" type="date" class="input" />

      <label>{{ $t('prescription.diagnosis') }}</label>
      <textarea v-model="form.diagnosis" class="input" rows="2"></textarea>

      <label>{{ $t('prescription.notes') }}</label>
      <textarea v-model="form.notes" class="input" rows="2"></textarea>

      <!-- Dynamic medicines -->
      <div class="medicines-section">
        <h3>💊 {{ $t('prescription.medicines') }}</h3>
        <div v-for="(med, i) in medicines" :key="i" class="medicine-form">
          <input v-model="med.name" :placeholder="$t('prescription.medicineName')" class="input" />
          <div class="med-row">
            <input v-model="med.dosage" :placeholder="$t('prescription.dosage')" class="input small" />
            <input v-model="med.frequency" :placeholder="$t('prescription.frequency')" class="input small" />
          </div>
          <div class="med-row">
            <input v-model="med.duration" :placeholder="$t('prescription.duration')" class="input small" />
            <input v-model="med.timing" :placeholder="$t('prescription.timing')" class="input small" />
          </div>
          <button type="button" @click="removeMedicine(i)" class="btn-remove">
            {{ $t('prescription.removeMedicine') }}
          </button>
        </div>
        <button type="button" @click="addMedicine" class="btn-add">
          {{ $t('prescription.addMedicine') }}
        </button>
      </div>

      <button type="submit" :disabled="!image || submitting" class="btn-primary">
        {{ submitting ? $t('common.loading') : $t('prescription.submit') }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
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

interface MedicineForm {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
}

const medicines = ref<MedicineForm[]>([]);

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
.form { display: flex; flex-direction: column; gap: 12px; }
label { font-weight: 500; font-size: 14px; }
.input {
  padding: 10px 14px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  font-size: 15px;
}
.input:focus { border-color: var(--color-primary); }
.small { flex: 1; }
.med-row { display: flex; gap: 8px; margin-top: 6px; }
.medicines-section { background: var(--color-surface); border-radius: var(--radius); padding: 16px; }
.medicines-section h3 { margin-bottom: 12px; }
.medicine-form { padding: 12px 0; border-bottom: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 6px; }
.medicine-form:last-child { border-bottom: none; }
.btn-add { width: 100%; padding: 10px; background: none; border: 2px dashed var(--color-primary); border-radius: 8px; color: var(--color-primary); margin-top: 8px; }
.btn-remove { width: 100%; padding: 8px; background: none; color: var(--color-danger); font-size: 13px; }
.btn-primary { padding: 14px; background: var(--color-primary); color: white; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 8px; }
.btn-primary:disabled { opacity: 0.5; }
.error { color: var(--color-danger); text-align: center; }
</style>