const Doctor = require("../models/Doctor");

// GET /api/doctors (liste publique - seulement les validés)
exports.getDoctors = async (req, res) => {
  try {
    const { search } = req.query;
    const doctors = await Doctor.findAllValidated(search);
    res.json(doctors);
  } catch (err) {
    console.error("Erreur getDoctors:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.is_validated) {
      return res.status(404).json({ message: "Médecin introuvable" });
    }
    res.json(doctor);
  } catch (err) {
    console.error("Erreur getDoctor:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/doctors/profile (médecin connecté complète son profil)
exports.updateProfile = async (req, res) => {
  try {
    const { speciality, description, address, phone } = req.body;
    const doctor = await Doctor.createOrUpdate(req.user.id, {
      speciality, description, address, phone,
    });
    res.json({ message: "Profil mis à jour", doctor });
  } catch (err) {
    console.error("Erreur updateProfile:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/doctors/me (profil du médecin connecté)
exports.getMyProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Complétez d'abord votre profil médecin" });
    }
    res.json(doctor);
  } catch (err) {
    console.error("Erreur getMyProfile:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};