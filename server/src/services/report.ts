import { pool } from '../db/pool.js';

interface ReportRow {
  id: string;
  user_id: string;
  image_url: string;
  report_type: string | null;
  lab_name: string | null;
  report_date: string | null;
  notes: string | null;
  created_at: string;
}

interface CreateReportInput {
  userId: string;
  imageUrl: string;
  reportType?: string;
  labName?: string;
  reportDate?: string;
  notes?: string;
}

export async function createReport(input: CreateReportInput): Promise<ReportRow> {
  const result = await pool.query<ReportRow>(
    `INSERT INTO reports (user_id, image_url, report_type, lab_name, report_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [input.userId, input.imageUrl, input.reportType || null, input.labName || null,
     input.reportDate || null, input.notes || null]
  );
  return result.rows[0];
}

export async function getReports(userId: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const countResult = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM reports WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query<ReportRow>(
    `SELECT * FROM reports WHERE user_id = $1
     ORDER BY report_date DESC, created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { reports: result.rows, total, page, limit };
}

export async function deleteReport(reportId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM reports WHERE id = $1 AND user_id = $2',
    [reportId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
