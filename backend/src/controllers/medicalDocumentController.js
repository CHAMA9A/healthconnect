const pool = require("../config/database");
const MedicalDocument = require("../models/MedicalDocument");

// POST /api/medical-documents
exports.create = async (req, res) => {
  try {
    const { patient_id, file_name, file_type } = req.body;
    if (!patient_id || !file_name) {
      return res.status(400).json({ message: "patient_id et file_name sont requis" });
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

    const doc = await MedicalDocument.create({
      patientId: patient_id,
      fileName: file_name,
      fileType: file_type || "other",
    });
    res.status(201).json({ message: "Document ajouté", document: doc });
  } catch (err) {
    console.error("Erreur createDocument:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/medical-documents/patient/:patientId
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

    const docs = await MedicalDocument.findByPatientId(patientId);
    res.json(docs);
  } catch (err) {
    console.error("Erreur getDocuments:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};