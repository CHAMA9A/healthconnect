const pool = require("../config/database");
const MedicalResult = require("../models/MedicalResult");

// POST /api/medical-results
exports.create = async (req, res) => {
  try {
    const { patient_id, title, result_value, comment } = req.body;
    if (!patient_id || !title || !result_value) {
      return res.status(400).json({ message: "patient_id, title et result_value sont requis" });
    }

    const doctor = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1", [req.user.id]
    );
    if (!doctor.rows[0]) {
      return res.status(400).json({ message: "Profil médecin introuvable" });
    }

    // Vérifier la relation médecin-patient
    const rel = await pool.query(
      `SELECT 1 FROM appointments WHERE doctor_id = $1 AND patient_id = $2 AND status IN ('CONFIRMED', 'COMPLETED') LIMIT 1`,
      [doctor.rows[0].id, patient_id]
    );
    if (rel.rows.length === 0) {
      return res.status(403).json({ message: "Vous n'avez aucun rendez-vous avec ce patient" });
    }

    const result = await MedicalResult.create({
      patientId: patient_id,
      doctorId: doctor.rows[0].id,
      title,
      resultValue: result_value,
      comment: comment || "",
    });
    res.status(201).json({ message: "Résultat ajouté", result });
  } catch (err) {
    console.error("Erreur createResult:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/medical-results/patient/:patientId
exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === "PATIENT" && parseInt(patientId) !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (req.user.role === "DOCTOR") {
      const doctor = await pool.query(
        "SELECT id FROM doctors WHERE user_id = $1", [req.user.id]
      );
      if (doctor.rows[0]) {
        const rel = await pool.query(
          `SELECT 1 FROM appointments WHERE doctor_id = $1 AND patient_id = $2 AND status IN ('CONFIRMED', 'COMPLETED') LIMIT 1`,
          [doctor.rows[0].id, patientId]
        );
        if (rel.rows.length === 0) {
          return res.status(403).json({ message: "Accès refusé" });
        }
      }
    }

    const results = await MedicalResult.findByPatientId(patientId);
    res.json(results);
  } catch (err) {
    console.error("Erreur getResults:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};