import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { searchDoctors, getDoctorById, updateDoctorProfile } from '../services/doctor.js';

const router = Router();

// GET /api/doctors — search/list
router.get('/', async (req, res) => {
  const query = req.query.q as string | undefined;
  const specialization = req.query.specialization as string | undefined;
  const doctors = await searchDoctors(query, specialization);
  res.json({ ok: true, data: doctors });
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  const doctor = await getDoctorById(req.params.id);
  if (!doctor) {
    res.status(404).json({ ok: false, error: 'Doctor not found' });
    return;
  }
  res.json({ ok: true, data: doctor });
});

// PUT /api/doctors/profile — update own doctor profile (requires auth + doctor role)
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  if (req.userRole !== 'doctor') {
    res.status(403).json({ ok: false, error: 'Only doctors can update their profile' });
    return;
  }

  const schema = z.object({
    specialization: z.string().max(200).optional(),
    licenseNumber: z.string().max(100).optional(),
    consultationFee: z.number().int().min(0).optional(),
    bio: z.string().optional(),
    availableHours: z.any().optional(),
    videoEnabled: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const doctor = await updateDoctorProfile(req.userId!, parsed.data);
  res.json({ ok: true, data: doctor });
});

export default router;
