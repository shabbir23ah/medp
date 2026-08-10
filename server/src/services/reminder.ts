import { pool } from '../db/pool.js';

interface ReminderRow {
  id: string;
  user_id: string;
  type: 'medicine' | 'appointment' | 'revisit' | 'report';
  title: string;
  datetime: string;
  repeat_rule: string | null;
  enabled: boolean;
  created_at: string;
}

interface CreateReminderInput {
  userId: string;
  type: string;
  title: string;
  datetime: string;
  repeatRule?: string;
}

export async function createReminder(input: CreateReminderInput): Promise<ReminderRow> {
  const result = await pool.query<ReminderRow>(
    `INSERT INTO reminders (user_id, type, title, datetime, repeat_rule)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [input.userId, input.type, input.title, input.datetime, input.repeatRule || null]
  );
  return result.rows[0];
}

export async function getReminders(userId: string): Promise<ReminderRow[]> {
  const result = await pool.query<ReminderRow>(
    'SELECT * FROM reminders WHERE user_id = $1 ORDER BY datetime ASC',
    [userId]
  );
  return result.rows;
}

export async function updateReminder(
  reminderId: string,
  userId: string,
  data: { type?: string; title?: string; datetime?: string; repeatRule?: string | null; enabled?: boolean }
): Promise<ReminderRow | null> {
  const fields: string[] = [];
  const values: (string | boolean | null)[] = [];
  let idx = 1;

  if (data.type !== undefined) { fields.push(`type = $${idx++}`); values.push(data.type); }
  if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
  if (data.datetime !== undefined) { fields.push(`datetime = $${idx++}`); values.push(data.datetime); }
  if (data.repeatRule !== undefined) { fields.push(`repeat_rule = $${idx++}`); values.push(data.repeatRule); }
  if (data.enabled !== undefined) { fields.push(`enabled = $${idx++}`); values.push(data.enabled); }

  if (fields.length === 0) {
    const existing = await pool.query<ReminderRow>(
      'SELECT * FROM reminders WHERE id = $1 AND user_id = $2',
      [reminderId, userId]
    );
    return existing.rows[0] || null;
  }

  values.push(reminderId);
  values.push(userId);

  const result = await pool.query<ReminderRow>(
    `UPDATE reminders SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteReminder(reminderId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM reminders WHERE id = $1 AND user_id = $2',
    [reminderId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getDueReminders(): Promise<ReminderRow[]> {
  const result = await pool.query<ReminderRow>(
    `SELECT * FROM reminders
     WHERE enabled = true AND datetime <= NOW()
     ORDER BY datetime ASC`
  );
  return result.rows;
}