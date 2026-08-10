import { pool } from '../db/pool.js';
import { generateOtp, verifyOtp } from '../utils/otp.js';

export interface UserRow {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  nid: string | null;
  dob: string | null;
  profile_pic: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export async function sendOtp(phone: string): Promise<void> {
  await generateOtp(phone);
}

export async function checkOtp(phone: string, code: string): Promise<boolean> {
  return verifyOtp(phone, code);
}

export async function getOrCreateUser(phone: string): Promise<{ user: UserRow; isNew: boolean }> {
  const existing = await pool.query<UserRow>(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );

  if (existing.rows.length > 0) {
    return { user: existing.rows[0], isNew: false };
  }

  const result = await pool.query<UserRow>(
    'INSERT INTO users (phone) VALUES ($1) RETURNING *',
    [phone]
  );

  return { user: result.rows[0], isNew: true };
}
