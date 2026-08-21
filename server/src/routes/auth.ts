import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { sendOtp, checkOtp, getOrCreateUser } from '../services/auth.js';
import { pool } from '../db/pool.js';
import { normalizePhone } from '../utils/phone.js';

const router = Router();

// Validate loose input, then canonicalize so 018X / 880X / +880X all
// resolve to the SAME account
const phoneSchema = z.string()
  .min(6).max(20)
  .regex(/^\+?[0-9]+$/, 'Invalid phone number')
  .transform(normalizePhone);

const sendOtpSchema = z.object({
  phone: phoneSchema,
});

const verifyOtpSchema = z.object({
  phone: phoneSchema,
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
  phone: phoneSchema,
  code: z.string().length(6).optional(),
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

  // If a bearer token is provided (user already verified via verify-otp), trust it
  let verifiedUserId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), config.JWT_SECRET) as { userId: string };
      verifiedUserId = payload.userId;
    } catch { /* fall through to OTP check */ }
  }

  if (!verifiedUserId) {
    // No token: require a valid OTP
    if (!parsed.data.code) {
      res.status(400).json({ ok: false, error: 'OTP code is required' });
      return;
    }
    const valid = await checkOtp(parsed.data.phone, parsed.data.code);
    if (!valid) {
      res.status(401).json({ ok: false, error: 'Invalid or expired OTP' });
      return;
    }
  }

  const { user } = await getOrCreateUser(parsed.data.phone);

  // If a verified token user exists, make sure it matches the phone's user
  if (verifiedUserId && verifiedUserId !== user.id) {
    res.status(401).json({ ok: false, error: 'Phone number does not match verified session' });
    return;
  }

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
