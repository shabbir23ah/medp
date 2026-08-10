import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApi } from '../composables/useApi';

export interface Medicine {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  timing: string | null;
}

export interface Prescription {
  id: string;
  user_id: string;
  image_url: string;
  doctor_name: string | null;
  hospital: string | null;
  diagnosis: string | null;
  prescribed_date: string;
  notes: string | null;
  medicines: Medicine[];
  created_at: string;
}

export const usePrescriptionsStore = defineStore('prescriptions', () => {
  const prescriptions = ref<Prescription[]>([]);
  const total = ref(0);
  const page = ref(1);
  const loading = ref(false);

  async function fetchPrescriptions(pageNum = 1) {
    const api = useApi();
    loading.value = true;
    try {
      const { data } = await api.get('/prescriptions', { params: { page: pageNum, limit: 20 } });
      if (data.ok) {
        if (pageNum === 1) {
          prescriptions.value = data.data.prescriptions;
        } else {
          prescriptions.value.push(...data.data.prescriptions);
        }
        total.value = data.data.total;
        page.value = pageNum;
      }
    } finally {
      loading.value = false;
    }
  }

  async function getPrescription(id: string): Promise<Prescription | null> {
    const api = useApi();
    const { data } = await api.get(`/prescriptions/${id}`);
    return data.ok ? data.data : null;
  }

  async function deletePrescription(id: string) {
    const api = useApi();
    await api.delete(`/prescriptions/${id}`);
    prescriptions.value = prescriptions.value.filter(p => p.id !== id);
  }

  async function uploadPrescription(formData: FormData) {
    const api = useApi();
    const { data } = await api.post('/prescriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.ok) {
      prescriptions.value.unshift(data.data);
    }
    return data;
  }

  return { prescriptions, total, page, loading, fetchPrescriptions, getPrescription, deletePrescription, uploadPrescription };
});
