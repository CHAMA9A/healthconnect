const pool = require("../config/database");

class Message {
  // Récupérer les conversations d'un utilisateur (distinct appointment_ids)
  static async getConversations(userId) {
    const result = await pool.query(
      `SELECT DISTINCT ON (a.id)
        a.id as appointment_id,
        a.date,
        a.start_time,
        a.end_time,
        a.status,
        m.created_at as last_message_at,
        m.content as last_message,
        CASE
          WHEN a.patient_id = $1 THEN 'sent'
          ELSE 'received'
        END as last_message_direction,
        CASE
          WHEN a.patient_id = $1 THEN u_doctor.first_name || ' ' || u_doctor.last_name
          ELSE u_patient.first_name || ' ' || u_patient.last_name
        END as other_party_name,
        CASE
          WHEN a.patient_id = $1 THEN u_doctor.first_name || ' ' || u_doctor.last_name
          ELSE u_patient.first_name || ' ' || u_patient.last_name
        END as participant_name
      FROM appointments a
      JOIN users u_patient ON u_patient.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users u_doctor ON u_doctor.id = d.user_id
      LEFT JOIN messages m ON m.appointment_id = a.id
      WHERE (a.patient_id = $1 OR a.doctor_id IN (SELECT id FROM doctors WHERE user_id = $1))
        AND a.status IN ('CONFIRMED', 'COMPLETED')
      ORDER BY a.id, m.created_at DESC NULLS LAST`,
      [userId]
    );
    return result.rows;
  }

  // Récupérer les messages d'une conversation (appointment)
  static async getByAppointment(appointmentId, userId) {
    const result = await pool.query(
      `SELECT m.*, u.first_name, u.last_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.appointment_id = $1
         AND (EXISTS (
           SELECT 1 FROM appointments a
           WHERE a.id = $1 AND a.patient_id = $2
         ) OR EXISTS (
           SELECT 1 FROM appointments a
           JOIN doctors d ON d.id = a.doctor_id
           WHERE a.id = $1 AND d.user_id = $2
         ))
       ORDER BY m.created_at ASC`,
      [appointmentId, userId]
    );
    return result.rows;
  }

  static async create({ appointmentId, senderId, content }) {
    const result = await pool.query(
      `INSERT INTO messages (appointment_id, sender_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [appointmentId, senderId, content]
    );
    return result.rows[0];
  }
}

module.exports = Message;