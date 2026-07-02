const pool = require("../config/database");
const MedicalRecord = require("../models/MedicalRecord");

// Vérifie si un médecin a eu un rendez-vous avec un patient
async function hasDoctorPatientAccess(doctorId, patientId) {
  const result = await pool.query(
    `SELECT 1 FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     WHERE d.id = $1 AND a.patient_id = $2 AND a.status IN ('CONFIRMED', 'COMPLETED')
     LIMIT 1`,
    [doctorId, patientId]
  );
  return result.rows.length > 0;
}

// GET /api/medical-records/me (patient voit son propre dossier)
exports.getMyRecord = async (req, res) => {
  try {
    let record = await MedicalRecord.findByPatientId(req.user.id);
    if (!record) {
      // Créer un dossier vide si pas encore existant
      record = await MedicalRecord.createOrUpdate(req.user.id, {
        history: "", allergies: "", treatments: "",
      });
    }
    res.json(record);
  } catch (err) {
    console.error("Erreur getMyRecord:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/medical-records/me (patient modifie son dossier)
exports.updateMyRecord = async (req, res) => {
  try {
    const { history, allergies, treatments } = req.body;
    const record = await MedicalRecord.createOrUpdate(req.user.id, {
      history, allergies, treatments,
    });
    res.json({ message: "Dossier mis à jour", record });
  } catch (err) {
    console.error("Erreur updateMyRecord:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/medical-records/patient/:patientId (médecin consulte le dossier d'un patient)
exports.getPatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Le médecin doit avoir eu un rendez-vous avec ce patient
    const doctor = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1", [req.user.id]
    );
    if (!doctor.rows[0]) {
      return res.status(400).json({ message: "Profil médecin introuvable" });
    }

    const hasAccess = await hasDoctorPatientAccess(doctor.rows[0].id, patientId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Vous n'avez pas accès au dossier de ce patient (aucun rendez-vous trouvé)",
      });
    }

    const record = await MedicalRecord.findByPatientId(patientId);
    if (!record) {
      return res.status(404).json({ message: "Aucun dossier médical pour ce patient" });
    }
    res.json(record);
  } catch (err) {
    console.error("Erreur getPatientRecord:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/medical-records/doctors/patients (liste des patients du médecin)
exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1", [req.user.id]
    );
    if (!doctor.rows[0]) {
      return res.status(400).json({ message: "Profil médecin introuvable" });
    }

    const result = await pool.query(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email,
              COUNT(a.id) FILTER (WHERE a.status = 'COMPLETED') as completed_count,
              MAX(a.date) as last_appointment
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       WHERE a.doctor_id = $1 AND a.status IN ('CONFIRMED', 'COMPLETED')
       GROUP BY u.id, u.first_name, u.last_name, u.email
       ORDER BY u.last_name ASC`,
      [doctor.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getDoctorPatients:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};