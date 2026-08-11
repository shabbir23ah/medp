import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { pool } from '../db/pool.js';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} from '../services/prescription.js';

const router = Router();
router.use(authenticate);

// POST /api/prescriptions — upload with image
router.post('/', upload.single('image'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: 'Prescription image is required' });
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  let medicines: { name: string; dosage?: string; frequency?: string; duration?: string; timing?: string }[] = [];

  try {
    if (req.body.medicines) {
      medicines = JSON.parse(req.body.medicines);
    }
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid medicines JSON' });
    return;
  }

  const prescription = await createPrescription({
    userId: req.userId!,
    imageUrl,
    doctorName: req.body.doctor_name,
    hospital: req.body.hospital,
    diagnosis: req.body.diagnosis,
    prescribedDate: req.body.prescribed_date,
    notes: req.body.notes,
    medicines,
  });

  res.status(201).json({ ok: true, data: prescription });
});

// GET /api/prescriptions — list with pagination
router.get('/', async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const result = await getPrescriptions(req.userId!, page, limit);
  res.json({ ok: true, data: result });
});

// GET /api/prescriptions/:id
router.get('/:id', async (req: AuthRequest, res) => {
  const prescription = await getPrescriptionById(req.params.id, req.userId!);
  if (!prescription) {
    res.status(404).json({ ok: false, error: 'Prescription not found' });
    return;
  }
  res.json({ ok: true, data: prescription });
});

// PUT /api/prescriptions/:id
const updateSchema = z.object({
  doctorName: z.string().max(200).optional(),
  hospital: z.string().max(300).optional(),
  diagnosis: z.string().optional(),
  prescribedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
});

router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const prescription = await updatePrescription(req.params.id, req.userId!, parsed.data);
  if (!prescription) {
    res.status(404).json({ ok: false, error: 'Prescription not found' });
    return;
  }
  res.json({ ok: true, data: prescription });
});

// DELETE /api/prescriptions/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  const deleted = await deletePrescription(req.params.id, req.userId!);
  if (!deleted) {
    res.status(404).json({ ok: false, error: 'Prescription not found' });
    return;
  }
  res.json({ ok: true });
});

// POST /api/prescriptions/push — doctor pushes prescription to patient
const pushSchema = z.object({
  patientId: z.string().uuid(),
  doctorName: z.string().max(200).optional(),
  hospital: z.string().max(300).optional(),
  diagnosis: z.string().optional(),
  prescribedDate: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
    timing: z.string().optional(),
  })).optional(),
});

router.post('/push', async (req: AuthRequest, res) => {
  if (req.userRole !== 'doctor') {
    res.status(403).json({ ok: false, error: 'Only doctors can push prescriptions' });
    return;
  }

  const parsed = pushSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  // Get doctor's name
  const doctorResult = await pool.query(
    'SELECT name FROM users WHERE id = $1', [req.userId]
  );
  const doctorName = parsed.data.doctorName || doctorResult.rows[0]?.name || 'Doctor';

  const prescription = await createPrescription({
    userId: parsed.data.patientId,
    imageUrl: '',
    doctorName,
    hospital: parsed.data.hospital,
    diagnosis: parsed.data.diagnosis,
    prescribedDate: parsed.data.prescribedDate,
    notes: parsed.data.notes,
    medicines: parsed.data.medicines,
  });

  // Set doctor_id on the prescription
  await pool.query(
    'UPDATE prescriptions SET doctor_id = $1 WHERE id = $2',
    [req.userId, prescription.id]
  );

  res.status(201).json({ ok: true, data: prescription });
});

export default router;