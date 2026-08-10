import { pool } from '../pool.js';
import { getOrCreateUser } from '../../services/auth.js';

async function seed() {
  console.log('Seeding database...');

  // Create test user
  const { user } = await getOrCreateUser('+8801712345678');
  console.log('Test user:', user.id, user.phone);

  // Add sample prescriptions
  await pool.query(
    `INSERT INTO prescriptions (user_id, image_url, doctor_name, hospital, diagnosis, prescribed_date, notes)
     VALUES ($1, '/uploads/sample-rx.jpg', 'Dr. Rahman', 'Dhaka Medical College', 'Upper respiratory infection', '2026-07-15', 'Feeling better after 3 days')`,
    [user.id]
  );

  await pool.query(
    `INSERT INTO prescriptions (user_id, image_url, doctor_name, hospital, diagnosis, prescribed_date)
     VALUES ($1, '/uploads/sample-rx2.jpg', 'Dr. Fatima Akhter', 'Square Hospital', 'Vitamin D deficiency', '2026-06-01')`,
    [user.id]
  );

  // Add sample report
  await pool.query(
    `INSERT INTO reports (user_id, image_url, report_type, lab_name, report_date)
     VALUES ($1, '/uploads/sample-report.jpg', 'Blood Test', 'Ibn Sina Diagnostic', '2026-07-20')`,
    [user.id]
  );

  // Add sample reminders
  await pool.query(
    `INSERT INTO reminders (user_id, type, title, datetime, repeat_rule)
     VALUES
     ($1, 'medicine', 'Take vitamin D', '2026-08-11T08:00:00Z', 'daily'),
     ($1, 'appointment', 'Follow-up with Dr. Rahman', '2026-08-25T10:00:00Z', NULL)`,
    [user.id]
  );

  console.log('Seed complete!');
  console.log('Login with phone: +8801712345678, OTP: 123456');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
