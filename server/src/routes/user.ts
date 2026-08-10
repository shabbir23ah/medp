import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getUserById, updateUserProfile } from '../services/user.js';

const router = Router();

// All routes require auth
router.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).nullable().optional(),
  nid: z.string().max(50).nullable().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').nullable().optional(),
  language: z.enum(['en', 'bn', 'es', 'fr']).optional(),
});

// GET /api/user/profile
router.get('/profile', async (req: AuthRequest, res) => {
  const user = await getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ ok: false, error: 'User not found' });
    return;
  }
  res.json({
    ok: true,
    data: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      nid: user.nid,
      dob: user.dob,
      profilePic: user.profile_pic,
      language: user.language,
    },
  });
});

// PUT /api/user/profile (text fields)
router.put('/profile', async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const user = await updateUserProfile(req.userId!, parsed.data);
  res.json({
    ok: true,
    data: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      nid: user.nid,
      dob: user.dob,
      profilePic: user.profile_pic,
      language: user.language,
    },
  });
});

// PUT /api/user/profile/picture (file upload)
router.put('/profile/picture', upload.single('picture'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: 'No image file provided' });
    return;
  }

  const profilePic = `/uploads/${req.file.filename}`;
  const user = await updateUserProfile(req.userId!, { profilePic });

  res.json({
    ok: true,
    data: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      nid: user.nid,
      dob: user.dob,
      profilePic: user.profile_pic,
      language: user.language,
    },
  });
});

export default router;
