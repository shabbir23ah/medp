import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getDoctorReviews, getDoctorRating, checkInteractions, createPlan, getPatientPlans, toggleMilestone } from '../services/enhancements.js';
import { pool } from '../db/pool.js';

const router = Router();
router.use(authenticate);

// ── Reviews ──

// GET /api/enhancements/doctors/:id/reviews
router.get('/doctors/:id/reviews', async (req, res) => {
  const [reviews, rating] = await Promise.all([
    getDoctorReviews(req.params.id),
    getDoctorRating(req.params.id),
  ]);
  res.json({ ok: true, data: { reviews, rating } });
});

// POST /api/enhancements/doctors/:id/reviews (patient only)
router.post('/doctors/:id/reviews', async (req: AuthRequest, res) => {
  if (req.userRole === 'doctor') { res.status(403).json({ ok: false, error: 'Doctors cannot review' }); return; }
  const schema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(500).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }

  const doctorId = String(req.params.id);
  const patientId = String(req.userId);
  const existing = await pool.query('SELECT id FROM doctor_reviews WHERE doctor_id = $1 AND patient_id = $2', [doctorId, patientId]);
  let review;
  if (existing.rows.length > 0) {
    review = (await pool.query(
      'UPDATE doctor_reviews SET rating = $1, comment = $2 WHERE doctor_id = $3 AND patient_id = $4 RETURNING *',
      [parsed.data.rating, parsed.data.comment || null, doctorId, patientId]
    )).rows[0];
  } else {
    review = (await pool.query(
      'INSERT INTO doctor_reviews (doctor_id, patient_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [doctorId, patientId, parsed.data.rating, parsed.data.comment || null]
    )).rows[0];
  }
  res.status(201).json({ ok: true, data: review });
});

// ── Drug interactions ──

// POST /api/enhancements/drug-check (doctor only)
router.post('/drug-check', async (req: AuthRequest, res) => {
  if (req.userRole !== 'doctor') { res.status(403).json({ ok: false, error: 'Only doctors' }); return; }
  const schema = z.object({ drugs: z.array(z.string().min(2).max(100)).min(2).max(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }
  const interactions = await checkInteractions(parsed.data.drugs);
  res.json({ ok: true, data: interactions });
});

// ── Treatment plans ──

// POST /api/enhancements/plans (doctor only)
router.post('/plans', async (req: AuthRequest, res) => {
  if (req.userRole !== 'doctor') { res.status(403).json({ ok: false, error: 'Only doctors' }); return; }
  const schema = z.object({
    patientId: z.string().uuid(),
    title: z.string().min(2).max(300),
    description: z.string().optional(),
    milestones: z.array(z.object({ title: z.string().min(2).max(300), targetDate: z.string().optional() })).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }
  const plan = await createPlan(req.userId!, parsed.data.patientId, parsed.data.title, parsed.data.description, parsed.data.milestones);
  res.status(201).json({ ok: true, data: plan });
});

// GET /api/enhancements/plans — patient's own plans
router.get('/plans', async (req: AuthRequest, res) => {
  const plans = await getPatientPlans(req.userId!);
  res.json({ ok: true, data: plans });
});

// PUT /api/enhancements/milestones/:id — toggle completion
router.put('/milestones/:id', async (req: AuthRequest, res) => {
  const schema = z.object({ completed: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: 'Invalid' }); return; }
  const m = await toggleMilestone(req.params.id, parsed.data.completed);
  if (!m) { res.status(404).json({ ok: false, error: 'Not found' }); return; }
  res.json({ ok: true, data: m });
});

export default router;
