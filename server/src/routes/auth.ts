import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { sendOtp, checkOtp, getOrCreateUser } from '../services/auth.js';
import { pool } from '../db/pool.js';

const router = Router();

const sendOtpSchema = z.object({
  phone: z.string().min(6).max(20).regex(/^\+?[0-9]+$/, 'Invalid phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(6).max(20),
  code: z.string().length(6),
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  await sendOtp(parsed.data.phone);
  res.json({ ok: true });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const valid = await checkOtp(parsed.data.phone, parsed.data.code);
  if (!valid) {
    res.status(401).json({ ok: false, error: 'Invalid or expired OTP' });
    return;
  }

  const { user, isNew } = await getOrCreateUser(parsed.data.phone);

  const token = jwt.sign({ userId: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: '30d' });

  res.json({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        nid: user.nid,
        dob: user.dob,
        profilePic: user.profile_pic,
        language: user.language,
        role: user.role,
      },
      isNew,
    },
  });
});

// POST /api/auth/register — set role and optional doctor profile
const registerSchema = z.object({
  phone: z.string().min(6).max(20).regex(/^\+?[0-9]+$/),
  code: z.string().length(6),
  role: z.enum(['patient', 'doctor', 'pharmacy']),
  name: z.string().min(1).max(100).optional(),
  specialization: z.string().max(200).optional(),
  licenseNumber: z.string().max(100).optional(),
  consultationFee: z.number().int().min(0).optional(),
  bio: z.string().optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const valid = await checkOtp(parsed.data.phone, parsed.data.code);
  if (!valid) {
    res.status(401).json({ ok: false, error: 'Invalid or expired OTP' });
    return;
  }

  const { user } = await getOrCreateUser(parsed.data.phone);

  // Update role and name
  await pool.query(
    'UPDATE users SET role = $1, name = COALESCE($2, name), updated_at = NOW() WHERE id = $3',
    [parsed.data.role, parsed.data.name || null, user.id]
  );

  // If doctor, create doctor profile
  if (parsed.data.role === 'doctor') {
    await pool.query(
      `INSERT INTO doctor_profiles (user_id, specialization, license_number, consultation_fee, bio)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET specialization = $2, license_number = $3, consultation_fee = $4, bio = $5, updated_at = NOW()`,
      [user.id, parsed.data.specialization || null, parsed.data.licenseNumber || null,
       parsed.data.consultationFee || 0, parsed.data.bio || null]
    );
  }

  const updated = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [user.id]
  );

  const token = jwt.sign(
    { userId: user.id, role: parsed.data.role },
    config.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        phone: updated.rows[0].phone,
        name: updated.rows[0].name,
        email: updated.rows[0].email,
        nid: updated.rows[0].nid,
        dob: updated.rows[0].dob,
        profilePic: updated.rows[0].profile_pic,
        language: updated.rows[0].language,
        role: parsed.data.role,
      },
    },
  });
});

export default router;
