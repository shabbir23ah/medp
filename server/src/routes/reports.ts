import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { createReport, getReports, deleteReport } from '../services/report.js';

const router = Router();
router.use(authenticate);

router.post('/', upload.single('image'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: 'Report image is required' });
    return;
  }

  const report = await createReport({
    userId: req.userId!,
    imageUrl: `/uploads/${req.file.filename}`,
    reportType: req.body.report_type,
    labName: req.body.lab_name,
    reportDate: req.body.report_date,
    notes: req.body.notes,
  });

  res.status(201).json({ ok: true, data: report });
});

router.get('/', async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const result = await getReports(req.userId!, page, limit);
  res.json({ ok: true, data: result });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const deleted = await deleteReport(req.params.id, req.userId!);
  if (!deleted) {
    res.status(404).json({ ok: false, error: 'Report not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
