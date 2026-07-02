const pool = require("../config/database");

class MedicalRecord {
  static async findByPatientId(patientId) {
    const result = await pool.query(
      "SELECT * FROM medical_records WHERE patient_id = $1",
      [patientId]
    );
    return result.rows[0] || null;
  }

  static async createOrUpdate(patientId, { history, allergies, treatments }) {
    const existing = await this.findByPatientId(patientId);
    if (existing) {
      const result = await pool.query(
        `UPDATE medical_records SET history = $1, allergies = $2, treatments = $3, updated_at = NOW()
         WHERE patient_id = $4 RETURNING *`,
        [history, allergies, treatments, patientId]
      );
      return result.rows[0];
    }
    const result = await pool.query(
      `INSERT INTO medical_records (patient_id, history, allergies, treatments)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, history, allergies, treatments]
    );
    return result.rows[0];
  }
}

module.exports = MedicalRecord;