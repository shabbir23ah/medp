import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import {
  createAppointment,
  getAppointmentsAsPatient,
  getAppointmentsAsDoctor,
  updateAppointmentStatus,
} from '../services/appointment.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
});

// POST /api/appointments
router.post('/', async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const appt = await createAppointment(
    req.userId!,
    parsed.data.doctorId,
    parsed.data.scheduledAt,
    parsed.data.notes
  );

  res.status(201).json({ ok: true, data: appt });
});

// GET /api/appointments
router.get('/', async (req: AuthRequest, res) => {
  const appointments = req.userRole === 'doctor'
    ? await getAppointmentsAsDoctor(req.userId!)
    : await getAppointmentsAsPatient(req.userId!);

  res.json({ ok: true, data: appointments });
});

// PUT /api/appointments/:id
router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const appt = await updateAppointmentStatus(req.params.id, req.userId!, parsed.data.status);
  if (!appt) {
    res.status(404).json({ ok: false, error: 'Appointment not found' });
    return;
  }
  res.json({ ok: true, data: appt });
});

export default router;
