import { config } from '../config.js';

// In-memory OTP store for dev (clears on server restart)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function generateOtp(phone: string): Promise<string> {
  if (config.OTP_MOCK) {
    const code = '123456';
    otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min
    console.log(`[OTP MOCK] Code for ${phone}: ${code}`);
    return code;
  }
  // Real WhatsApp OTP integration point for production
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  // TODO: Integrate WhatsApp Business API here
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  const valid = entry.code === code;
  if (valid) otpStore.delete(phone); // one-time use
  return valid;
}
