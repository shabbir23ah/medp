import { pool } from '../db/pool.js';

interface MedicineInput {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  timing?: string;
}

interface CreatePrescriptionInput {
  userId: string;
  imageUrl: string;
  doctorName?: string;
  hospital?: string;
  diagnosis?: string;
  prescribedDate?: string;
  notes?: string;
  medicines?: MedicineInput[];
}

interface PrescriptionRow {
  id: string;
  user_id: string;
  image_url: string;
  doctor_name: string | null;
  hospital: string | null;
  diagnosis: string | null;
  prescribed_date: string;
  notes: string | null;
  created_at: string;
}

interface MedicineRow {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  timing: string | null;
}

export async function createPrescription(input: CreatePrescriptionInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const presResult = await client.query<PrescriptionRow>(
      `INSERT INTO prescriptions (user_id, image_url, doctor_name, hospital, diagnosis, prescribed_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [input.userId, input.imageUrl, input.doctorName || null, input.hospital || null,
       input.diagnosis || null, input.prescribedDate || null, input.notes || null]
    );

    const prescription = presResult.rows[0];
    const medicines: MedicineRow[] = [];

    if (input.medicines && input.medicines.length > 0) {
      for (const med of input.medicines) {
        const medResult = await client.query<MedicineRow>(
          `INSERT INTO medicines (prescription_id, name, dosage, frequency, duration, timing)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [prescription.id, med.name, med.dosage || null, med.frequency || null,
           med.duration || null, med.timing || null]
        );
        medicines.push(medResult.rows[0]);
      }
    }

    await client.query('COMMIT');
    return { ...prescription, medicines };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getPrescriptions(userId: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const countResult = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM prescriptions WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query<PrescriptionRow>(
    `SELECT p.*, COALESCE(json_agg(
       json_build_object('id', m.id, 'name', m.name, 'dosage', m.dosage,
         'frequency', m.frequency, 'duration', m.duration, 'timing', m.timing)
     ) FILTER (WHERE m.id IS NOT NULL), '[]') as medicines
     FROM prescriptions p
     LEFT JOIN medicines m ON m.prescription_id = p.id
     WHERE p.user_id = $1
     GROUP BY p.id
     ORDER BY p.prescribed_date DESC, p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { prescriptions: result.rows, total, page, limit };
}

export async function getPrescriptionById(prescriptionId: string, userId: string) {
  const result = await pool.query(
    `SELECT p.*, COALESCE(json_agg(
       json_build_object('id', m.id, 'name', m.name, 'dosage', m.dosage,
         'frequency', m.frequency, 'duration', m.duration, 'timing', m.timing)
     ) FILTER (WHERE m.id IS NOT NULL), '[]') as medicines
     FROM prescriptions p
     LEFT JOIN medicines m ON m.prescription_id = p.id
     WHERE p.id = $1 AND p.user_id = $2
     GROUP BY p.id`,
    [prescriptionId, userId]
  );
  return result.rows[0] || null;
}

export async function updatePrescription(
  prescriptionId: string,
  userId: string,
  data: { doctorName?: string; hospital?: string; diagnosis?: string; prescribedDate?: string; notes?: string }
) {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  let idx = 1;

  if (data.doctorName !== undefined) { fields.push(`doctor_name = $${idx++}`); values.push(data.doctorName); }
  if (data.hospital !== undefined) { fields.push(`hospital = $${idx++}`); values.push(data.hospital); }
  if (data.diagnosis !== undefined) { fields.push(`diagnosis = $${idx++}`); values.push(data.diagnosis); }
  if (data.prescribedDate !== undefined) { fields.push(`prescribed_date = $${idx++}`); values.push(data.prescribedDate); }
  if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }

  if (fields.length === 0) return getPrescriptionById(prescriptionId, userId);

  values.push(prescriptionId);
  values.push(userId);

  await pool.query(
    `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx}`,
    values
  );

  return getPrescriptionById(prescriptionId, userId);
}

export async function deletePrescription(prescriptionId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM prescriptions WHERE id = $1 AND user_id = $2',
    [prescriptionId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}