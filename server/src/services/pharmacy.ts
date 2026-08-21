import { pool } from '../db/pool.js';

export async function searchMedicines(query?: string, category?: string) {
  if (category && query) {
    return (await pool.query(
      `SELECT pm.*, u.name as pharmacy_name FROM pharmacy_medicines pm
       JOIN users u ON u.id = pm.pharmacy_id
       WHERE pm.stock > 0 AND pm.category ILIKE $1 AND pm.name ILIKE $2
       ORDER BY pm.name ASC LIMIT 100`,
      [`%${category}%`, `%${query}%`]
    )).rows;
  }
  if (category) {
    return (await pool.query(
      `SELECT pm.*, u.name as pharmacy_name FROM pharmacy_medicines pm
       JOIN users u ON u.id = pm.pharmacy_id
       WHERE pm.stock > 0 AND pm.category ILIKE $1
       ORDER BY pm.name ASC LIMIT 100`,
      [`%${category}%`]
    )).rows;
  }
  if (query) {
    return (await pool.query(
      `SELECT pm.*, u.name as pharmacy_name FROM pharmacy_medicines pm
       JOIN users u ON u.id = pm.pharmacy_id
       WHERE pm.stock > 0 AND pm.name ILIKE $1
       ORDER BY pm.name ASC LIMIT 100`,
      [`%${query}%`]
    )).rows;
  }
  return (await pool.query(
    `SELECT pm.*, u.name as pharmacy_name FROM pharmacy_medicines pm
     JOIN users u ON u.id = pm.pharmacy_id
     WHERE pm.stock > 0 ORDER BY pm.name ASC LIMIT 100`
  )).rows;
}

export async function getPharmacyMedicines(pharmacyId: string) {
  return (await pool.query('SELECT * FROM pharmacy_medicines WHERE pharmacy_id = $1', [pharmacyId])).rows;
}

export async function addMedicine(pharmacyId: string, data: { name: string; category?: string; price: number; stock?: number; imageUrl?: string; description?: string; requiresPrescription?: boolean }) {
  return (await pool.query(
    `INSERT INTO pharmacy_medicines (pharmacy_id, name, category, price, stock, image_url, description, requires_prescription)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [pharmacyId, data.name, data.category || null, data.price, data.stock || 0, data.imageUrl || null, data.description || null, data.requiresPrescription || false]
  )).rows[0];
}

export async function deleteMedicine(medicineId: string, pharmacyId: string) {
  return ((await pool.query('DELETE FROM pharmacy_medicines WHERE id = $1 AND pharmacy_id = $2', [medicineId, pharmacyId])).rowCount ?? 0) > 0;
}

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderError';
  }
}

/** Client may send medicineId + quantity only. Price and stock are always taken from DB. */
export async function createOrder(
  patientId: string,
  pharmacyId: string,
  items: { medicineId: string; quantity: number }[],
  deliveryAddress: string,
  patientPhone: string
) {
  if (!items.length) throw new OrderError('Order must include at least one item');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const priced: { medicineId: string; quantity: number; price: number }[] = [];
    let total = 0;

    for (const item of items) {
      // Lock row, verify pharmacy ownership, enforce stock atomically
      const med = await client.query<{ id: string; price: number; stock: number; pharmacy_id: string }>(
        `SELECT id, price, stock, pharmacy_id FROM pharmacy_medicines
         WHERE id = $1 AND pharmacy_id = $2 FOR UPDATE`,
        [item.medicineId, pharmacyId]
      );
      if (med.rows.length === 0) {
        throw new OrderError('Medicine not found for this pharmacy');
      }
      const row = med.rows[0];
      if (row.stock < item.quantity) {
        throw new OrderError(`Insufficient stock for medicine ${item.medicineId}`);
      }

      const deducted = await client.query(
        `UPDATE pharmacy_medicines SET stock = stock - $1, updated_at = NOW()
         WHERE id = $2 AND stock >= $1 RETURNING id`,
        [item.quantity, item.medicineId]
      );
      if ((deducted.rowCount ?? 0) === 0) {
        throw new OrderError(`Insufficient stock for medicine ${item.medicineId}`);
      }

      priced.push({ medicineId: item.medicineId, quantity: item.quantity, price: row.price });
      total += item.quantity * row.price;
    }

    const order = (await client.query(
      'INSERT INTO pharmacy_orders (patient_id, pharmacy_id, total_amount, delivery_address, patient_phone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [patientId, pharmacyId, total, deliveryAddress, patientPhone]
    )).rows[0];

    for (const item of priced) {
      await client.query(
        'INSERT INTO pharmacy_order_items (order_id, medicine_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.medicineId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getPatientOrders(patientId: string) {
  return (await pool.query('SELECT * FROM pharmacy_orders WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 50', [patientId])).rows;
}

export async function getPharmacyOrders(pharmacyId: string) {
  return (await pool.query('SELECT * FROM pharmacy_orders WHERE pharmacy_id = $1 ORDER BY created_at DESC LIMIT 50', [pharmacyId])).rows;
}

export async function getOrderItems(orderId: string) {
  return (await pool.query(
    `SELECT poi.*, pm.name as medicine_name FROM pharmacy_order_items poi
     JOIN pharmacy_medicines pm ON pm.id = poi.medicine_id WHERE poi.order_id = $1`, [orderId]
  )).rows;
}

export async function updateOrderStatus(orderId: string, pharmacyId: string, status: string) {
  return (await pool.query(
    'UPDATE pharmacy_orders SET status = $1, updated_at = NOW() WHERE id = $2 AND pharmacy_id = $3 RETURNING *',
    [status, orderId, pharmacyId]
  )).rows[0] || null;
}
