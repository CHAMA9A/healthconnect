const pool = require("../config/database");

class MedicalReport {
  static async findByPatientId(patientId) {
    const result = await pool.query(
      `SELECT mr.*, d.id as doctor_record_id, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM medical_reports mr
       JOIN doctors d ON d.id = mr.doctor_id
       JOIN users u ON u.id = d.user_id
       WHERE mr.patient_id = $1
       ORDER BY mr.created_at DESC`,
      [patientId]
    );
    return result.rows;
  }

  static async create({ patientId, doctorId, appointmentId, title, content }) {
    const result = await pool.query(
      `INSERT INTO medical_reports (patient_id, doctor_id, appointment_id, title, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientId, doctorId, appointmentId, title, content]
    );
    return result.rows[0];
  }
}

module.exports = MedicalReport;