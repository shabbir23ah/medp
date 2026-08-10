import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
} from '../services/reminder.js';
import { savePushSubscription } from '../services/notification.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  type: z.enum(['medicine', 'appointment', 'revisit', 'report']),
  title: z.string().min(1).max(200),
  datetime: z.string().datetime(),
  repeatRule: z.string().optional(),
});

router.post('/', async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const reminder = await createReminder({
    userId: req.userId!,
    ...parsed.data,
    repeatRule: parsed.data.repeatRule,
  });

  res.status(201).json({ ok: true, data: reminder });
});

router.get('/', async (req: AuthRequest, res) => {
  const reminders = await getReminders(req.userId!);
  res.json({ ok: true, data: reminders });
});

const updateSchema = z.object({
  type: z.enum(['medicine', 'appointment', 'revisit', 'report']).optional(),
  title: z.string().min(1).max(200).optional(),
  datetime: z.string().datetime().optional(),
  repeatRule: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
});

router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.errors[0].message });
    return;
  }

  const reminder = await updateReminder(req.params.id, req.userId!, parsed.data);
  if (!reminder) {
    res.status(404).json({ ok: false, error: 'Reminder not found' });
    return;
  }
  res.json({ ok: true, data: reminder });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const deleted = await deleteReminder(req.params.id, req.userId!);
  if (!deleted) {
    res.status(404).json({ ok: false, error: 'Reminder not found' });
    return;
  }
  res.json({ ok: true });
});

// POST /api/reminders/push-subscribe — save browser push subscription
router.post('/push-subscribe', async (req: AuthRequest, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ ok: false, error: 'Invalid push subscription' });
    return;
  }

  await savePushSubscription(req.userId!, { endpoint, keys });
  res.json({ ok: true });
});

export default router;