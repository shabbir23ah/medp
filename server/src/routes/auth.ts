import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { sendOtp, checkOtp, getOrCreateUser } from '../services/auth.js';

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

  const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '30d' });

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
      },
      isNew,
    },
  });
});

export default router;
