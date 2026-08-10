import { pool } from '../db/pool.js';
import type { UserRow } from './auth.js';

export async function getUserById(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

interface UpdateProfileInput {
  name?: string;
  email?: string | null;
  nid?: string | null;
  dob?: string | null;
  language?: string;
  profilePic?: string | null;
}

export async function updateUserProfile(userId: string, data: UpdateProfileInput): Promise<UserRow> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.nid !== undefined) {
    fields.push(`nid = $${paramIndex++}`);
    values.push(data.nid);
  }
  if (data.dob !== undefined) {
    fields.push(`dob = $${paramIndex++}`);
    values.push(data.dob);
  }
  if (data.language !== undefined) {
    fields.push(`language = $${paramIndex++}`);
    values.push(data.language);
  }
  if (data.profilePic !== undefined) {
    fields.push(`profile_pic = $${paramIndex++}`);
    values.push(data.profilePic);
  }

  if (fields.length === 0) {
    const current = await getUserById(userId);
    if (!current) throw new Error('User not found');
    return current;
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query<UserRow>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
}
