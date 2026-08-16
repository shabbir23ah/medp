import { pool } from '../db/pool.js';

// ── Doctor Reviews ──

export async function addReview(doctorId: string, patientId: string, rating: number, comment?: string) {
  const existing = await pool.query('SELECT id FROM doctor_reviews WHERE doctor_id = $1 AND patient_id = $2', [doctorId, patientId]);
  if (existing.rows.length > 0) {
    return (await pool.query(
      'UPDATE doctor_reviews SET rating = $1, comment = $2 WHERE doctor_id = $3 AND patient_id = $4 RETURNING *',
      [rating, comment || null, doctorId, patientId]
    )).rows[0];
  }
  return (await pool.query(
    'INSERT INTO doctor_reviews (doctor_id, patient_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
    [doctorId, patientId, rating, comment || null]
  )).rows[0];
}

export async function getDoctorReviews(doctorId: string) {
  return (await pool.query(
    `SELECT dr.*, u.name as patient_name FROM doctor_reviews dr
     JOIN users u ON u.id = dr.patient_id
     WHERE dr.doctor_id = $1 ORDER BY dr.created_at DESC LIMIT 50`, [doctorId]
  )).rows;
}

export async function getDoctorRating(doctorId: string): Promise<{ avg: number; count: number }> {
  const r = await pool.query(
    'SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as count FROM doctor_reviews WHERE doctor_id = $1', [doctorId]
  );
  return { avg: parseFloat(r.rows[0].avg) || 0, count: parseInt(r.rows[0].count) };
}

// ── Drug Interactions ──

export async function checkInteractions(drugs: string[]) {
  if (drugs.length < 2) return [];
  const found: any[] = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const r = await pool.query(
        `SELECT * FROM drug_interactions
         WHERE (LOWER(drug_a) = LOWER($1) AND LOWER(drug_b) = LOWER($2))
            OR (LOWER(drug_a) = LOWER($2) AND LOWER(drug_b) = LOWER($1))`,
        [drugs[i].trim(), drugs[j].trim()]
      );
      found.push(...r.rows);
    }
  }
  return found;
}

// ── Treatment Plans ──

export async function createPlan(doctorId: string, patientId: string, title: string, description?: string, milestones?: { title: string; targetDate?: string }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const plan = (await client.query(
      'INSERT INTO treatment_plans (doctor_id, patient_id, title, description) VALUES ($1,$2,$3,$4) RETURNING *',
      [doctorId, patientId, title, description || null]
    )).rows[0];
    if (milestones) {
      for (const m of milestones) {
        await client.query(
          'INSERT INTO plan_milestones (plan_id, title, target_date) VALUES ($1,$2,$3)',
          [plan.id, m.title, m.targetDate || null]
        );
      }
    }
    await client.query('COMMIT');
    return plan;
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}

export async function getPatientPlans(patientId: string) {
  const plans = (await pool.query(
    'SELECT * FROM treatment_plans WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]
  )).rows;
  for (const p of plans) {
    p.milestones = (await pool.query(
      'SELECT * FROM plan_milestones WHERE plan_id = $1 ORDER BY target_date ASC NULLS LAST', [p.id]
    )).rows;
    const doc = (await pool.query('SELECT name FROM users WHERE id = $1', [p.doctor_id])).rows[0];
    p.doctor_name = doc?.name || 'Doctor';
  }
  return plans;
}

export async function toggleMilestone(milestoneId: string, completed: boolean) {
  return (await pool.query(
    'UPDATE plan_milestones SET completed = $1 WHERE id = $2 RETURNING *', [completed, milestoneId]
  )).rows[0] || null;
}
