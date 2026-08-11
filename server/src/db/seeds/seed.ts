import { pool } from '../pool.js';

async function seed() {
  console.log('🌱 Seeding demo data...\n');

  // Clean existing demo data
  await pool.query("DELETE FROM chat_messages");
  await pool.query("DELETE FROM appointments");
  await pool.query("DELETE FROM medicines");
  await pool.query("DELETE FROM prescriptions");
  await pool.query("DELETE FROM reports");
  await pool.query("DELETE FROM reminders");
  await pool.query("DELETE FROM doctor_profiles");
  await pool.query("DELETE FROM users");

  // ── 1. PATIENT: Rahul Sharma ──
  const p1 = await pool.query(
    `INSERT INTO users (phone, name, email, nid, dob, role, language)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    ['+8801000000001', 'Rahul Sharma', 'rahul@email.com', '1234567890', '1995-03-15', 'patient', 'en']
  );
  const patientId = p1.rows[0].id;
  console.log('👤 Patient: Rahul Sharma | +8801000000001');

  const rx1 = await pool.query(
    `INSERT INTO prescriptions (user_id, image_url, doctor_name, hospital, diagnosis, prescribed_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [patientId, '/uploads/demo-rx-1.jpg', 'Dr. Sarah Chen', 'Dhaka Medical College', 'Upper Respiratory Infection', '2026-07-20', 'Prescribed antibiotics for 7 days']
  );
  await pool.query(
    `INSERT INTO medicines (prescription_id, name, dosage, frequency, duration, timing) VALUES
     ($1, $2, $3, $4, $5, $6),
     ($1, $7, $8, $9, $10, $11),
     ($1, $12, $13, $14, $15, $16)`,
    [rx1.rows[0].id,
     'Amoxicillin', '500mg', 'Twice daily', '7 days', 'After meal',
     'Paracetamol', '500mg', 'As needed', '5 days', 'After meal',
     'Cetirizine', '10mg', 'Once daily', '10 days', 'At bedtime']
  );

  const rx2 = await pool.query(
    `INSERT INTO prescriptions (user_id, image_url, doctor_name, hospital, diagnosis, prescribed_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [patientId, '/uploads/demo-rx-2.jpg', 'Dr. James Park', 'Square Hospital', 'Vitamin D Deficiency', '2026-06-01']
  );
  await pool.query(
    `INSERT INTO medicines (prescription_id, name, dosage, frequency, duration) VALUES
     ($1, $2, $3, $4, $5),
     ($1, $6, $7, $8, $9)`,
    [rx2.rows[0].id,
     'Vitamin D3', '2000 IU', 'Once daily', '3 months',
     'Calcium', '500mg', 'Once daily', '3 months']
  );

  await pool.query(
    `INSERT INTO reports (user_id, image_url, report_type, lab_name, report_date, notes) VALUES
     ($1, $2, $3, $4, $5, $6),
     ($1, $7, $8, $9, $10, $11)`,
    [patientId,
     '/uploads/demo-report-1.jpg', 'Complete Blood Count', 'Ibn Sina Diagnostic', '2026-07-22', 'All parameters normal',
     '/uploads/demo-report-2.jpg', 'Chest X-Ray', 'Dhaka Medical Imaging', '2026-07-21', 'No abnormalities detected']
  );

  await pool.query(
    `INSERT INTO reminders (user_id, type, title, datetime, repeat_rule) VALUES
     ($1, $2, $3, $4, $5),
     ($1, $6, $7, $8, $9),
     ($1, $10, $11, $12, $13),
     ($1, $14, $15, $16, $17)`,
    [patientId,
     'medicine', 'Take Amoxicillin 500mg', '2026-08-12T08:00:00+06:00', 'daily',
     'medicine', 'Take Vitamin D3', '2026-08-12T09:00:00+06:00', 'daily',
     'appointment', 'Follow-up with Dr. Sarah Chen', '2026-08-25T10:00:00+06:00', null,
     'revisit', 'Check Vitamin D levels', '2026-09-01T11:00:00+06:00', null]
  );

  // ── 2. DOCTOR: Dr. Sarah Chen ──
  const d1 = await pool.query(
    `INSERT INTO users (phone, name, email, role, language)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['+8801000000002', 'Dr. Sarah Chen', 'sarah.chen@medmail.com', 'doctor', 'en']
  );
  const doctorId = d1.rows[0].id;
  
  await pool.query(
    `INSERT INTO doctor_profiles (user_id, specialization, license_number, consultation_fee, bio, video_enabled, available_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [doctorId, 'Cardiologist', 'BMDC-45678', 800,
     'Board-certified cardiologist with 12 years of experience. Specializing in preventive cardiology and heart failure management.',
     true, JSON.stringify({mon:'09:00-17:00',tue:'09:00-17:00',wed:'09:00-14:00',thu:'09:00-17:00',fri:'09:00-13:00'})]
  );
  console.log('👨‍⚕️ Doctor: Dr. Sarah Chen | +8801000000002');

  // ── 3. PHARMACY: MedPlus Pharmacy ──
  await pool.query(
    `INSERT INTO users (phone, name, email, role, language)
     VALUES ($1, $2, $3, $4, $5)`,
    ['+8801000000003', 'MedPlus Pharmacy', 'info@medplus.com', 'pharmacy', 'en']
  );
  console.log('💊 Pharmacy: MedPlus Pharmacy | +8801000000003');

  // ── 4. Appointments ──
  const apt1 = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [patientId, doctorId, '2026-08-15T10:00:00+06:00', 'confirmed', 'Initial consultation - chest pain evaluation']
  );
  
  await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [patientId, doctorId, '2026-08-20T14:00:00+06:00', 'pending', 'Follow-up after blood work']
  );
  console.log('📅 2 appointments (1 confirmed, 1 pending)');

  // ── 5. Chat messages ──
  await pool.query(
    `INSERT INTO chat_messages (sender_id, receiver_id, appointment_id, content, type) VALUES
     ($1, $2, $3, $4, $5),
     ($6, $7, $8, $9, $10),
     ($11, $12, $13, $14, $15),
     ($16, $17, $18, $19, $20),
     ($21, $22, $23, $24, $25)`,
    [
      patientId, doctorId, apt1.rows[0].id, 'Hello Dr. Chen, I have been experiencing some chest discomfort lately.', 'text',
      doctorId, patientId, apt1.rows[0].id, 'I see. How long has this been going on? Is it worse with exercise?', 'text',
      patientId, doctorId, apt1.rows[0].id, 'About 2 weeks now. Yes, it gets worse when I walk upstairs.', 'text',
      doctorId, patientId, apt1.rows[0].id, 'Let me schedule you for an ECG and some blood work. Please come in tomorrow morning.', 'text',
      patientId, doctorId, apt1.rows[0].id, 'Thank you doctor. I will be there at 10 AM.', 'text',
    ]
  );
  console.log('💬 5 chat messages');

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 DEMO LOGINS (OTP: 123456)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Patient:  +8801000000001');
  console.log('👨‍⚕️ Doctor:   +8801000000002');
  console.log('💊 Pharmacy: +8801000000003');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await pool.end();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
