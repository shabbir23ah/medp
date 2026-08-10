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
      @delete="handleDelete"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import ReminderCard from '../components/ReminderCard.vue';
import { useRemindersStore } from '../stores/reminders';

const store = useRemindersStore();
onMounted(() => store.fetchReminders());

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

async function handleDelete(id: string) {
  if (confirm('Delete this reminder?')) await store.deleteReminder(id);
}
</script>

<style scoped>
.add-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.input { padding: 10px 14px; border: 2px solid var(--color-border); border-radius: 8px; outline: none; font-size: 15px; }
.input:focus { border-color: var(--color-primary); }
.btn-primary { padding: 12px; background: var(--color-primary); color: white; border-radius: 8px; font-weight: 600; }
.center { text-align: center; padding: 32px 0; color: var(--color-text-muted); }
</style>
