import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApi } from '../composables/useApi';

export interface Reminder {
  id: string;
  user_id: string;
  type: 'medicine' | 'appointment' | 'revisit' | 'report';
  title: string;
  datetime: string;
  repeat_rule: string | null;
  enabled: boolean;
  created_at: string;
}

export const useRemindersStore = defineStore('reminders', () => {
  const reminders = ref<Reminder[]>([]);
  const loading = ref(false);

  async function fetchReminders() {
    const api = useApi();
    loading.value = true;
    try {
      const { data } = await api.get('/reminders');
      if (data.ok) reminders.value = data.data;
    } finally { loading.value = false; }
  }

  async function createReminder(input: { type: string; title: string; datetime: string; repeatRule?: string }) {
    const api = useApi();
    const { data } = await api.post('/reminders', input);
    if (data.ok) reminders.value.push(data.data);
    return data;
  }

  async function updateReminder(id: string, input: Partial<Reminder>) {
    const api = useApi();
    const { data } = await api.put(`/reminders/${id}`, input);
    if (data.ok) {
      const idx = reminders.value.findIndex(r => r.id === id);
      if (idx >= 0) reminders.value[idx] = data.data;
    }
    return data;
  }

  async function toggleReminder(id: string, enabled: boolean) {
    return updateReminder(id, { enabled } as any);
  }

  async function deleteReminder(id: string) {
    const api = useApi();
    await api.delete(`/reminders/${id}`);
    reminders.value = reminders.value.filter(r => r.id !== id);
  }

  return { reminders, loading, fetchReminders, createReminder, updateReminder, toggleReminder, deleteReminder };
});
