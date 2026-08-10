import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/medprescription',
  UPLOAD_DIR: process.env.UPLOAD_DIR || resolve(__dirname, '../../uploads'),
  OTP_MOCK: process.env.OTP_MOCK !== 'false', // true in dev
};
