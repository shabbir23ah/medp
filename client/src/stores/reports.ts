import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApi } from '../composables/useApi';

export interface Report {
  id: string;
  user_id: string;
  image_url: string;
  report_type: string | null;
  lab_name: string | null;
  report_date: string | null;
  notes: string | null;
  created_at: string;
}

export const useReportsStore = defineStore('reports', () => {
  const reports = ref<Report[]>([]);
  const total = ref(0);
  const loading = ref(false);

  async function fetchReports(pageNum = 1) {
    const api = useApi();
    loading.value = true;
    try {
      const { data } = await api.get('/reports', { params: { page: pageNum, limit: 20 } });
      if (data.ok) {
        if (pageNum === 1) reports.value = data.data.reports;
        else reports.value.push(...data.data.reports);
        total.value = data.data.total;
      }
    } finally { loading.value = false; }
  }

  async function uploadReport(formData: FormData) {
    const api = useApi();
    const { data } = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.ok) reports.value.unshift(data.data);
    return data;
  }

  async function deleteReport(id: string) {
    const api = useApi();
    await api.delete(`/reports/${id}`);
    reports.value = reports.value.filter(r => r.id !== id);
  }

  return { reports, total, loading, fetchReports, uploadReport, deleteReport };
});
