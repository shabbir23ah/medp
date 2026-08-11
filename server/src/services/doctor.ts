import { pool } from '../db/pool.js';

interface DoctorWithUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profile_pic: string | null;
  specialization: string | null;
  license_number: string | null;
  consultation_fee: number;
  bio: string | null;
  available_hours: any;
  video_enabled: boolean;
}

export async function searchDoctors(query?: string, specialization?: string) {
  let sql = '';
  let params: any[] = [];

  if (specialization && query) {
    sql = `SELECT u.id, u.phone, u.name, u.email, u.profile_pic,
            dp.specialization, dp.license_number, dp.consultation_fee,
            dp.bio, dp.available_hours, dp.video_enabled
     FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
     WHERE u.role = 'doctor' AND dp.specialization ILIKE $1
       AND (u.name ILIKE $2 OR dp.specialization ILIKE $3)
     ORDER BY u.name ASC LIMIT 50`;
    params = [`%${specialization}%`, `%${query}%`, `%${query}%`];
  } else if (specialization) {
    sql = `SELECT u.id, u.phone, u.name, u.email, u.profile_pic,
            dp.specialization, dp.license_number, dp.consultation_fee,
            dp.bio, dp.available_hours, dp.video_enabled
     FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
     WHERE u.role = 'doctor' AND dp.specialization ILIKE $1
     ORDER BY u.name ASC LIMIT 50`;
    params = [`%${specialization}%`];
  } else if (query) {
    sql = `SELECT u.id, u.phone, u.name, u.email, u.profile_pic,
            dp.specialization, dp.license_number, dp.consultation_fee,
            dp.bio, dp.available_hours, dp.video_enabled
     FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
     WHERE u.role = 'doctor' AND (u.name ILIKE $1 OR dp.specialization ILIKE $2)
     ORDER BY u.name ASC LIMIT 50`;
    params = [`%${query}%`, `%${query}%`];
  } else {
    sql = `SELECT u.id, u.phone, u.name, u.email, u.profile_pic,
            dp.specialization, dp.license_number, dp.consultation_fee,
            dp.bio, dp.available_hours, dp.video_enabled
     FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
     WHERE u.role = 'doctor'
     ORDER BY u.name ASC LIMIT 50`;
  }

  const result = await pool.query<DoctorWithUser>(sql, params);
  return result.rows;
}

export async function getDoctorById(userId: string) {
  const result = await pool.query<DoctorWithUser>(
    `SELECT u.id, u.phone, u.name, u.email, u.profile_pic,
            dp.specialization, dp.license_number, dp.consultation_fee,
            dp.bio, dp.available_hours, dp.video_enabled
     FROM users u JOIN doctor_profiles dp ON dp.user_id = u.id
     WHERE u.id = $1 AND u.role = 'doctor'`,
    [userId]
  );
  return result.rows[0] || null;
}

export async function updateDoctorProfile(userId: string, data: {
  specialization?: string;
  licenseNumber?: string;
  consultationFee?: number;
  bio?: string;
  availableHours?: any;
  videoEnabled?: boolean;
}) {
  await pool.query(
    `UPDATE doctor_profiles SET
       specialization = COALESCE($1, specialization),
       license_number = COALESCE($2, license_number),
       consultation_fee = COALESCE($3, consultation_fee),
       bio = COALESCE($4, bio),
       available_hours = COALESCE($5, available_hours),
       video_enabled = COALESCE($6, video_enabled),
       updated_at = NOW()
     WHERE user_id = $7`,
    [
      data.specialization ?? null,
      data.licenseNumber ?? null,
      data.consultationFee ?? null,
      data.bio ?? null,
      data.availableHours ? JSON.stringify(data.availableHours) : null,
      data.videoEnabled ?? null,
      userId,
    ]
  );

  return getDoctorById(userId);
}
