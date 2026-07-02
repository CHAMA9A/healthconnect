const pool = require("../config/database");

class Appointment {
  static async findById(id) {
    const result = await pool.query(
      `SELECT a.*,
              doc.id as doctor_record_id,
              doc.speciality, doc.address as doctor_address,
              u_doc.first_name as doctor_first_name, u_doc.last_name as doctor_last_name,
              u_pat.first_name as patient_first_name, u_pat.last_name as patient_last_name
       FROM appointments a
       JOIN doctors doc ON doc.id = a.doctor_id
       JOIN users u_doc ON u_doc.id = doc.user_id
       JOIN users u_pat ON u_pat.id = a.patient_id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByPatient(patientId) {
    const result = await pool.query(
      `SELECT a.*,
              doc.speciality, doc.address as doctor_address,
              u_doc.first_name as doctor_first_name, u_doc.last_name as doctor_last_name
       FROM appointments a
       JOIN doctors doc ON doc.id = a.doctor_id
       JOIN users u_doc ON u_doc.id = doc.user_id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.start_time DESC`,
      [patientId]
    );
    return result.rows;
  }

  static async findByDoctor(doctorId) {
    const result = await pool.query(
      `SELECT a.*,
              u_pat.first_name as patient_first_name, u_pat.last_name as patient_last_name,
              u_pat.email as patient_email
       FROM appointments a
       JOIN users u_pat ON u_pat.id = a.patient_id
       WHERE a.doctor_id = $1
       ORDER BY a.date DESC, a.start_time DESC`,
      [doctorId]
    );
    return result.rows;
  }

  static async create({ patientId, doctorId, availabilityId, date, startTime, endTime, reason }) {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, availability_id, date, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [patientId, doctorId, availabilityId, date, startTime, endTime, reason]
    );
    return result.rows[0];
  }

  static async update(id, patientId, { date, start_time, end_time, reason }) {
    const result = await pool.query(
      `UPDATE appointments SET date = $1, start_time = $2, end_time = $3, reason = $4
       WHERE id = $5 AND patient_id = $6 AND status NOT IN ('CANCELLED', 'COMPLETED')
       RETURNING *`,
      [date, start_time, end_time, reason, id, patientId]
    );
    return result.rows[0] || null;
  }

  static async cancel(id, patientId, reason) {
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'CANCELLED', cancelled_at = NOW(), cancellation_reason = $1
       WHERE id = $2 AND patient_id = $3 AND status != 'CANCELLED'
       RETURNING *`,
      [reason, id, patientId]
    );
    return result.rows[0] || null;
  }

  static async confirm(id, doctorId) {
    const roomName = `healthconnect-appointment-${id}`;
    const videoLink = `https://meet.jit.si/${roomName}`;
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'CONFIRMED',
           video_room_name = $3,
           video_link = $4,
           video_created_at = NOW()
       WHERE id = $1 AND doctor_id = $2 AND status = 'PENDING'
       RETURNING *`,
      [id, doctorId, roomName, videoLink]
    );
    return result.rows[0] || null;
  }

  static async complete(id, doctorId) {
    const result = await pool.query(
      `UPDATE appointments SET status = 'COMPLETED'
       WHERE id = $1 AND doctor_id = $2 AND status IN ('PENDING', 'CONFIRMED')
       RETURNING *`,
      [id, doctorId]
    );
    return result.rows[0] || null;
  }
}

module.exports = Appointment;