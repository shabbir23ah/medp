import { pool } from '../db/pool.js';

interface AppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  other_name?: string;
}

export async function createAppointment(patientId: string, doctorId: string, scheduledAt: string, notes?: string) {
  const result = await pool.query<AppointmentRow>(
    `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [patientId, doctorId, scheduledAt, notes || null]
  );
  return result.rows[0];
}

export async function getAppointmentsAsPatient(userId: string) {
  const result = await pool.query(
    `SELECT a.*, u.name as other_name
     FROM appointments a
     JOIN users u ON u.id = a.doctor_id
     WHERE a.patient_id = $1
     ORDER BY a.scheduled_at DESC
     LIMIT 50`,
    [userId]
  );
  return result.rows;
}

export async function getAppointmentsAsDoctor(userId: string) {
  const result = await pool.query(
    `SELECT a.*, u.name as other_name
     FROM appointments a
     JOIN users u ON u.id = a.patient_id
     WHERE a.doctor_id = $1
     ORDER BY a.scheduled_at DESC
     LIMIT 50`,
    [userId]
  );
  return result.rows;
}

export async function updateAppointmentStatus(appointmentId: string, userId: string, status: string) {
  const result = await pool.query<AppointmentRow>(
    `UPDATE appointments SET status = $1, updated_at = NOW()
     WHERE id = $2 AND (patient_id = $3 OR doctor_id = $3)
     RETURNING *`,
    [status, appointmentId, userId]
  );
  return result.rows[0] || null;
}
