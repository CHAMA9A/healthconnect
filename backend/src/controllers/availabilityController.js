const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");

// Helper : récupérer ou créer le profil docteur
async function getOrCreateDoctor(userId) {
  let doctor = await Doctor.findByUserId(userId);
  if (!doctor) {
    doctor = await Doctor.createOrUpdate(userId, {
      speciality: "Généraliste",
      description: "",
      address: "",
      phone: "",
    });
  }
  return doctor;
}

// POST /api/availabilities
exports.create = async (req, res) => {
  try {
    const doctor = await getOrCreateDoctor(req.user.id);
    const { date, start_time, end_time } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ message: "Date, heure de début et heure de fin requis" });
    }
    const availability = await Availability.create(doctor.id, { date, start_time, end_time });
    res.status(201).json({ message: "Disponibilité ajoutée", availability });
  } catch (err) {
    console.error("Erreur createAvailability:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/availabilities/doctor/:doctorId (créneaux disponibles)
exports.getByDoctor = async (req, res) => {
  try {
    const availabilities = await Availability.findByDoctorId(req.params.doctorId);
    res.json(availabilities);
  } catch (err) {
    console.error("Erreur getByDoctor:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/availabilities/mine (disponibilités du docteur connecté)
exports.getMine = async (req, res) => {
  try {
    const doctor = await getOrCreateDoctor(req.user.id);
    const availabilities = await Availability.findByDoctorId(doctor.id);
    res.json(availabilities);
  } catch (err) {
    console.error("Erreur getMine:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/availabilities/:id
exports.update = async (req, res) => {
  try {
    const doctor = await getOrCreateDoctor(req.user.id);

    const { date, start_time, end_time } = req.body;
    const availability = await Availability.update(req.params.id, doctor.id, { date, start_time, end_time });
    if (!availability) {
      return res.status(404).json({ message: "Disponibilité introuvable ou accès refusé" });
    }
    res.json({ message: "Disponibilité modifiée", availability });
  } catch (err) {
    console.error("Erreur updateAvailability:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/availabilities/:id
exports.remove = async (req, res) => {
  try {
    const doctor = await getOrCreateDoctor(req.user.id);

    const deleted = await Availability.remove(req.params.id, doctor.id);
    if (!deleted) {
      return res.status(404).json({ message: "Disponibilité introuvable ou accès refusé" });
    }
    res.json({ message: "Disponibilité supprimée" });
  } catch (err) {
    console.error("Erreur deleteAvailability:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};