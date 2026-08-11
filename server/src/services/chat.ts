import { pool } from '../db/pool.js';

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id: string | null;
  content: string;
  type: string;
  created_at: string;
  sender_name?: string;
}

export async function getChatHistory(appointmentId: string, userId: string) {
  const result = await pool.query<ChatMessage>(
    `SELECT cm.*, u.name as sender_name
     FROM chat_messages cm
     JOIN users u ON u.id = cm.sender_id
     JOIN appointments a ON a.id = cm.appointment_id
     WHERE cm.appointment_id = $1
       AND (a.patient_id = $2 OR a.doctor_id = $2)
     ORDER BY cm.created_at ASC
     LIMIT 200`,
    [appointmentId, userId]
  );
  return result.rows;
}

export async function sendMessage(senderId: string, receiverId: string, appointmentId: string, content: string, type: string = 'text') {
  const result = await pool.query<ChatMessage>(
    `INSERT INTO chat_messages (sender_id, receiver_id, appointment_id, content, type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [senderId, receiverId, appointmentId, content, type]
  );
  return result.rows[0];
}
