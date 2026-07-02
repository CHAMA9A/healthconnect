const pool = require("../config/database");
const MedicalReport = require("../models/MedicalReport");

// POST /api/medical-reports (médecin ajoute un compte rendu)
exports.create = async (req, res) => {
  try {
    const { patient_id, appointment_id, title, content } = req.body;
    if (!patient_id || !title || !content) {
      return res.status(400).json({ message: "patient_id, title et content sont requis" });
    }

    const doctor = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1", [req.user.id]
    );
    if (!doctor.rows[0]) {
      return res.status(400).json({ message: "Profil médecin introuvable" });
    }

    // Vérifier que le médecin a un rendez-vous avec ce patient
    const relation = await pool.query(
      `SELECT 1 FROM appointments
       WHERE doctor_id = $1 AND patient_id = $2 AND status IN ('CONFIRMED', 'COMPLETED')
       LIMIT 1`,
      [doctor.rows[0].id, patient_id]
    );
    if (relation.rows.length === 0) {
      return res.status(403).json({ message: "Vous n'avez aucun rendez-vous avec ce patient" });
    }

    const report = await MedicalReport.create({
      patientId: patient_id,
      doctorId: doctor.rows[0].id,
      appointmentId: appointment_id || null,
      title,
      content,
    });
    res.status(201).json({ message: "Compte rendu ajouté", report });
  } catch (err) {
    console.error("Erreur createReport:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/medical-reports/patient/:patientId
exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Vérification d'accès : patient lui-même ou médecin avec rendez-vous
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
          return res.status(403).json({ message: "Accès refusé : aucun rendez-vous avec ce patient" });
        }
      }
    }

    const reports = await MedicalReport.findByPatientId(patientId);
    res.json(reports);
  } catch (err) {
    console.error("Erreur getReports:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};