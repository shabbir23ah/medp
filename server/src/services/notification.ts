import { pool } from '../db/pool.js';
import { getDueReminders } from './reminder.js';

// In-memory store for push subscriptions (would be DB in production)
// But we already have push_subscriptions table in schema

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

export async function savePushSubscription(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> {
  // Upsert: remove existing, insert new
  await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [userId, sub.endpoint]);
  await pool.query(
    'INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key) VALUES ($1, $2, $3, $4)',
    [userId, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );
}

export async function getSubscriptionsForUser(userId: string): Promise<PushSubscription[]> {
  const result = await pool.query<PushSubscription>(
    'SELECT * FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}

export async function processScheduledNotifications(): Promise<void> {
  const dueReminders = await getDueReminders();

  for (const reminder of dueReminders) {
    const subs = await getSubscriptionsForUser(reminder.user_id);

    for (const sub of subs) {
      try {
        // In production, call web-push.sendNotification here
        // For now, log it (push requires VAPID keys configured)
        console.log(`[NOTIFY] Reminder "${reminder.title}" for user ${reminder.user_id}, type: ${reminder.type}`);
      } catch (err) {
        console.error(`Failed to send push to ${sub.endpoint}:`, err);
      }
    }

    // If repeat_rule is set, reschedule; otherwise delete
    if (reminder.repeat_rule) {
      // Simple reschedule: move to next occurrence (for daily/weekly)
      const nextDate = getNextOccurrence(reminder.datetime, reminder.repeat_rule);
      if (nextDate) {
        await pool.query(
          'UPDATE reminders SET datetime = $1 WHERE id = $2',
          [nextDate.toISOString(), reminder.id]
        );
      }
    } else {
      // One-time reminder: delete after firing
      await pool.query('DELETE FROM reminders WHERE id = $1', [reminder.id]);
    }
  }
}

function getNextOccurrence(from: string, rule: string): Date | null {
  const date = new Date(from);
  switch (rule) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      return date;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      return date;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      return date;
    default:
      return null;
  }
}