const Doctor = require("../models/Doctor");

// GET /api/admin/doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAllForAdmin();
    res.json(doctors);
  } catch (err) {
    console.error("Erreur adminGetDoctors:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/admin/doctors/:id/validate
exports.validateDoctor = async (req, res) => {
  try {
    const { isValidated } = req.body;
    if (typeof isValidated !== "boolean") {
      return res.status(400).json({ message: "Le champ isValidated (boolean) est requis" });
    }
    const doctor = await Doctor.validate(req.params.id, isValidated);
    if (!doctor) {
      return res.status(404).json({ message: "Médecin introuvable" });
    }
    const msg = isValidated ? "Médecin validé" : "Médecin désactivé";
    res.json({ message: msg, doctor });
  } catch (err) {
    console.error("Erreur validateDoctor:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};