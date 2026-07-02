const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");

// POST /api/appointments
exports.create = async (req, res) => {
  try {
    const { doctor_id, availability_id, date, start_time, end_time, reason } = req.body;
    if (!doctor_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier que le médecin existe et est validé
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor || !doctor.is_validated) {
      return res.status(404).json({ message: "Médecin introuvable" });
    }

    // Vérifier que le créneau est disponible
    if (availability_id) {
      const slot = await Availability.findById(availability_id);
      if (!slot || !slot.is_available) {
        return res.status(400).json({ message: "Ce créneau n'est plus disponible" });
      }
      // Marquer le créneau comme réservé
      await Availability.setAvailable(availability_id, false);
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId: doctor_id,
      availabilityId: availability_id,
      date,
      startTime: start_time,
      endTime: end_time,
      reason,
    });

    res.status(201).json({ message: "Rendez-vous créé", appointment });
  } catch (err) {
    console.error("Erreur createAppointment:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/appointments/patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findByPatient(req.user.id);
    res.json(appointments);
  } catch (err) {
    console.error("Erreur getPatientAppointments:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/appointments/doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(400).json({ message: "Profil médecin introuvable" });
    }
    const appointments = await Appointment.findByDoctor(doctor.id);
    res.json(appointments);
  } catch (err) {
    console.error("Erreur getDoctorAppointments:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/appointments/:id (patient modifie son rendez-vous)
exports.update = async (req, res) => {
  try {
    const { date, start_time, end_time, reason } = req.body;
    const appointment = await Appointment.update(req.params.id, req.user.id, {
      date, start_time, end_time, reason,
    });
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable ou modification impossible" });
    }
    res.json({ message: "Rendez-vous modifié", appointment });
  } catch (err) {
    console.error("Erreur updateAppointment:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/appointments/:id (patient annule)
exports.cancel = async (req, res) => {
  try {
    const { reason } = req.body;

    // Récupérer le rendez-vous avant annulation pour libérer le créneau
    const existing = await Appointment.findById(req.params.id);
    if (!existing || existing.patient_id !== req.user.id) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    const appointment = await Appointment.cancel(req.params.id, req.user.id, reason);
    if (!appointment) {
      return res.status(400).json({ message: "Impossible d'annuler ce rendez-vous" });
    }

    // Libérer le créneau
    if (existing.availability_id) {
      await Availability.setAvailable(existing.availability_id, true);
    }

    res.json({ message: "Rendez-vous annulé", appointment });
  } catch (err) {
    console.error("Erreur cancelAppointment:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/appointments/:id/confirm (médecin confirme)
exports.confirm = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) return res.status(400).json({ message: "Profil médecin introuvable" });

    const appointment = await Appointment.confirm(req.params.id, doctor.id);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable ou déjà confirmé" });
    }
    res.json({ message: "Rendez-vous confirmé", appointment });
  } catch (err) {
    console.error("Erreur confirmAppointment:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/appointments/:id/complete (médecin termine)
exports.complete = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) return res.status(400).json({ message: "Profil médecin introuvable" });

    const appointment = await Appointment.complete(req.params.id, doctor.id);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable ou déjà terminé" });
    }
    res.json({ message: "Rendez-vous terminé", appointment });
  } catch (err) {
    console.error("Erreur completeAppointment:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};