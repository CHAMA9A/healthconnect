const pool = require("../config/database");

class MedicalDocument {
  static async findByPatientId(patientId) {
    const result = await pool.query(
      "SELECT * FROM medical_documents WHERE patient_id = $1 ORDER BY created_at DESC",
      [patientId]
    );
    return result.rows;
  }

  static async create({ patientId, fileName, fileType }) {
    // En MVP, on stocke juste le nom — pas de vrai upload fichier
    const fileUrl = `/uploads/${patientId}/${fileName}`;
    const result = await pool.query(
      `INSERT INTO medical_documents (patient_id, file_name, file_url, file_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, fileName, fileUrl, fileType || "other"]
    );
    return result.rows[0];
  }
}

module.exports = MedicalDocument;