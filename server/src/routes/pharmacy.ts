import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { searchMedicines, addMedicine, createOrder, getPatientOrders, getPharmacyOrders, getOrderItems, updateOrderStatus } from '../services/pharmacy.js';
import { pool } from '../db/pool.js';

const router = Router();

// GET /api/pharmacy/medicines/mine — pharmacy's own catalog
router.get('/medicines/mine', authenticate, async (req: AuthRequest, res) => {
  if (req.userRole !== 'pharmacy') { res.status(403).json({ ok: false, error: 'Forbidden' }); return; }
  const r = await pool.query('SELECT * FROM pharmacy_medicines WHERE pharmacy_id = $1', [req.userId]);
  res.json({ ok: true, data: r.rows });
});

// GET /api/pharmacy/medicines — browse catalog (any authenticated user)
router.get('/medicines', authenticate, async (req, res) => {
  const query = req.query.q as string | undefined;
  const category = req.query.category as string | undefined;
  const medicines = await searchMedicines(query, category);
  res.json({ ok: true, data: medicines });
});

// POST /api/pharmacy/medicines — add medicine (pharmacy only)
router.post('/medicines', authenticate, async (req: AuthRequest, res) => {
  if (req.userRole !== 'pharmacy') {
    res.status(403).json({ ok: false, error: 'Only pharmacies can add medicines' });
    return;
  }
  const schema = z.object({
    name: z.string().min(1).max(200),
    category: z.string().max(100).optional(),
    price: z.number().int().min(1),
    stock: z.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
    description: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }
  const med = await addMedicine(req.userId!, parsed.data);
  res.status(201).json({ ok: true, data: med });
});

// DELETE /api/pharmacy/medicines/:id
router.delete('/medicines/:id', authenticate, async (req: AuthRequest, res) => {
  if (req.userRole !== 'pharmacy') { res.status(403).json({ ok: false, error: 'Forbidden' }); return; }
  const r = await pool.query('DELETE FROM pharmacy_medicines WHERE id = $1 AND pharmacy_id = $2', [req.params.id, req.userId]);
  if ((r.rowCount ?? 0) === 0) { res.status(404).json({ ok: false, error: 'Not found' }); return; }
  res.json({ ok: true });
});

// POST /api/pharmacy/orders — place order (patient)
router.post('/orders', authenticate, async (req: AuthRequest, res) => {
  const schema = z.object({
    pharmacyId: z.string().uuid(),
    items: z.array(z.object({ medicineId: z.string().uuid(), quantity: z.number().int().min(1), price: z.number().int().min(1) })),
    deliveryAddress: z.string().min(5),
    patientPhone: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }
  const order = await createOrder(req.userId!, parsed.data.pharmacyId, parsed.data.items, parsed.data.deliveryAddress, parsed.data.patientPhone);
  res.status(201).json({ ok: true, data: order });
});

// GET /api/pharmacy/orders — list orders
router.get('/orders', authenticate, async (req: AuthRequest, res) => {
  const orders = req.userRole === 'pharmacy'
    ? await getPharmacyOrders(req.userId!)
    : await getPatientOrders(req.userId!);
  res.json({ ok: true, data: orders });
});

// GET /api/pharmacy/orders/:id/items
router.get('/orders/:id/items', authenticate, async (req, res) => {
  const items = await getOrderItems(req.params.id);
  res.json({ ok: true, data: items });
});

// PUT /api/pharmacy/orders/:id — update status (pharmacy)
router.put('/orders/:id', authenticate, async (req: AuthRequest, res) => {
  if (req.userRole !== 'pharmacy') { res.status(403).json({ ok: false, error: 'Forbidden' }); return; }
  const schema = z.object({ status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: parsed.error.errors[0].message }); return; }
  const order = await updateOrderStatus(req.params.id, req.userId!, parsed.data.status);
  if (!order) { res.status(404).json({ ok: false, error: 'Not found' }); return; }
  res.json({ ok: true, data: order });
});

export default router;
