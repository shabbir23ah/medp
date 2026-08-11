import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getChatHistory, sendMessage } from '../services/chat.js';

const router = Router();
router.use(authenticate);

// GET /api/chat/:appointmentId
router.get('/:appointmentId', async (req: AuthRequest, res) => {
  const messages = await getChatHistory(req.params.appointmentId, req.userId!);
  res.json({ ok: true, data: messages });
});

// POST /api/chat/:appointmentId
router.post('/:appointmentId', async (req: AuthRequest, res) => {
  const { receiverId, content, type } = req.body;

  if (!receiverId || !content) {
    res.status(400).json({ ok: false, error: 'receiverId and content are required' });
    return;
  }

  const msg = await sendMessage(
    req.userId!,
    receiverId,
    req.params.appointmentId,
    content,
    type || 'text'
  );

  res.status(201).json({ ok: true, data: msg });
});

export default router;
