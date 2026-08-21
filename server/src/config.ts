import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { config as dotenv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Prefer an explicit ENV_FILE, then app/.env, then parent-of-app/.env
// (VPS keeps secrets outside the git checkout so `git reset --hard` is safe)
const candidates = [
  process.env.ENV_FILE,
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../.env'),
].filter(Boolean) as string[];

for (const path of candidates) {
  if (existsSync(path)) {
    dotenv({ path });
    break;
  }
}

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/medprescription',
  UPLOAD_DIR: process.env.UPLOAD_DIR || resolve(__dirname, '../../uploads'),
  OTP_MOCK: process.env.OTP_MOCK !== 'false', // true in dev
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
