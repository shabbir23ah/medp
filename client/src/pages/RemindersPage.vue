<template>
  <AppLayout :title="$t('reminder.title')">
    <!-- Add form -->
    <form @submit.prevent="handleAdd" class="add-form">
      <select v-model="newReminder.type" class="input" required>
        <option value="medicine">{{ $t('reminder.medicine') }}</option>
        <option value="appointment">{{ $t('reminder.appointment') }}</option>
        <option value="revisit">{{ $t('reminder.revisit') }}</option>
        <option value="report">{{ $t('reminder.report') }}</option>
      </select>
      <input v-model="newReminder.title" :placeholder="$t('reminder.reminderTitle')" class="input" required />
      <input v-model="newReminder.datetime" type="datetime-local" class="input" required />
      <select v-model="newReminder.repeatRule" class="input">
        <option value="">{{ $t('reminder.repeatNone') }}</option>
        <option value="daily">{{ $t('reminder.repeatDaily') }}</option>
        <option value="weekly">{{ $t('reminder.repeatWeekly') }}</option>
        <option value="monthly">{{ $t('reminder.repeatMonthly') }}</option>
      </select>
      <button type="submit" class="btn-primary">{{ $t('reminder.add') }}</button>
    </form>

    <!-- List -->
    <div v-if="store.reminders.length === 0" class="center">
      <p>{{ $t('reminder.noReminders') }}</p>
    </div>

    <ReminderCard
      v-for="r in store.reminders"
      :key="r.id"
      :reminder="r"
      @toggle="(id, enabled) => store.toggleReminder(id, enabled)"
      @delete="askDelete"
    />

    <!-- Inline confirm dialog -->
    <div v-if="confirmDeleteId" class="confirm-overlay" @click.self="confirmDeleteId = ''">
      <div class="confirm-dialog">
        <h4>Delete this reminder?</h4>
        <p>This cannot be undone.</p>
        <div class="confirm-actions">
          <button @click="confirmDeleteId = ''" class="btn-cancel">Cancel</button>
          <button @click="doDelete" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import ReminderCard from '../components/ReminderCard.vue';
import { useRemindersStore } from '../stores/reminders';

const store = useRemindersStore();
onMounted(() => store.fetchReminders());

const confirmDeleteId = ref('');

const newReminder = reactive({
  type: 'medicine',
  title: '',
  datetime: '',
  repeatRule: '',
});

async function handleAdd() {
  await store.createReminder({ ...newReminder });
  newReminder.title = '';
  newReminder.datetime = '';
}

function askDelete(id: string) {
  confirmDeleteId.value = id;
}

async function doDelete() {
  if (!confirmDeleteId.value) return;
  await store.deleteReminder(confirmDeleteId.value);
  confirmDeleteId.value = '';
}
</script>

<style scoped>
.add-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.input { padding: 10px 14px; border: 2px solid var(--border); border-radius: 12px; outline: none; font-size: 15px; background: var(--surface); color: var(--text); }
.input:focus { border-color: var(--primary); }
.btn-primary { padding: 14px; background: var(--primary); color: var(--primary-text); border-radius: 12px; font-weight: 700; font-size: 15px; }
.btn-primary:disabled { opacity: 0.5; }
.center { text-align: center; padding: 32px 0; color: var(--text-muted); }
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.confirm-dialog {
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
  padding: 24px; width: 100%; max-width: 320px; text-align: center;
}
.confirm-dialog h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.confirm-dialog p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.confirm-actions { display: flex; gap: 10px; }
.btn-cancel, .btn-delete { flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; }
.btn-cancel { background: var(--bg-secondary); color: var(--text); }
.btn-delete { background: var(--danger); color: white; }
</style>
