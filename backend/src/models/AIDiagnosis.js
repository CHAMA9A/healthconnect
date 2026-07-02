const pool = require("../config/database");

class AIDiagnosis {
  // Créer un nouveau pré-diagnostic
  static async create({ patientId, symptoms, riskLevel, suggestion, recommendation, disclaimer }) {
    const result = await pool.query(
      `INSERT INTO ai_diagnoses (patient_id, symptoms, risk_level, suggestion, recommendation, disclaimer)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [patientId, JSON.stringify(symptoms), riskLevel, suggestion, recommendation, disclaimer]
    );
    return result.rows[0];
  }

  // Récupérer l'historique d'un patient
  static async findByPatientId(patientId) {
    const result = await pool.query(
      `SELECT id, patient_id, symptoms, risk_level, suggestion, recommendation, disclaimer,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
       FROM ai_diagnoses
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );
    return result.rows;
  }

  // Récupérer un diagnostic par son ID (avec vérification patient)
  static async findById(id, patientId) {
    const result = await pool.query(
      `SELECT id, patient_id, symptoms, risk_level, suggestion, recommendation, disclaimer,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
       FROM ai_diagnoses
       WHERE id = $1 AND patient_id = $2`,
      [id, patientId]
    );
    return result.rows[0] || null;
  }
}

module.exports = AIDiagnosis;