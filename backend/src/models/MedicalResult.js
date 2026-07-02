const pool = require("../config/database");

class MedicalResult {
  static async findByPatientId(patientId) {
    const result = await pool.query(
      `SELECT res.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM medical_results res
       JOIN doctors d ON d.id = res.doctor_id
       JOIN users u ON u.id = d.user_id
       WHERE res.patient_id = $1
       ORDER BY res.created_at DESC`,
      [patientId]
    );
    return result.rows;
  }

  static async create({ patientId, doctorId, title, resultValue, comment }) {
    const result = await pool.query(
      `INSERT INTO medical_results (patient_id, doctor_id, title, result_value, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientId, doctorId, title, resultValue, comment]
    );
    return result.rows[0];
  }
}

module.exports = MedicalResult;