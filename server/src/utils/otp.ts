import { config } from '../config.js';
import { pool } from '../db/pool.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 min

export async function generateOtp(phone: string): Promise<string> {
  const code = config.OTP_MOCK
    ? '123456'
    : Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await pool.query(
    `INSERT INTO otps (phone, code, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (phone) DO UPDATE
       SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = NOW()`,
    [phone, code, expiresAt.toISOString()]
  );

  if (config.OTP_MOCK) {
    console.log(`[OTP MOCK] Code for ${phone}: ${code}`);
  } else {
    // TODO: Integrate WhatsApp / SMS provider here. Until then, OTP is stored
    // but not delivered — set OTP_MOCK=true for demos.
    console.log(`[OTP] Generated for ${phone} (provider not configured)`);
  }

  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const result = await pool.query<{ code: string; expires_at: Date }>(
    'SELECT code, expires_at FROM otps WHERE phone = $1',
    [phone]
  );

  if (result.rows.length === 0) return false;

  const entry = result.rows[0];
  if (new Date(entry.expires_at).getTime() < Date.now()) {
    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
    return false;
  }

  const valid = entry.code === code;
  if (valid) {
    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]); // one-time use
  }
  return valid;
}
