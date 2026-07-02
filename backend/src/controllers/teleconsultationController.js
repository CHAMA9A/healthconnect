const Teleconsultation = require("../models/Teleconsultation");

// GET /api/teleconsultation/:appointmentId
exports.getInfo = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const access = await Teleconsultation.checkAccess(appointmentId, userId, userRole);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const info = await Teleconsultation.getInfo(appointmentId);
    res.json(info);
  } catch (err) {
    console.error("Erreur getTeleconsultationInfo:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/teleconsultation/:appointmentId/generate
exports.generate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const access = await Teleconsultation.checkAccess(appointmentId, userId, userRole);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const { appointment } = access;

    // Si le lien existe déjà, le retourner
    if (appointment.video_link) {
      return res.json({
        video_link: appointment.video_link,
        video_room_name: appointment.video_room_name,
      });
    }

    // Générer un nouveau lien vidéo
    const roomName = `healthconnect-appointment-${appointmentId}`;
    const videoLink = `https://meet.jit.si/${roomName}`;

    const pool = require("../config/database");
    await pool.query(
      `UPDATE appointments
       SET video_room_name = $1, video_link = $2, video_created_at = NOW()
       WHERE id = $3`,
      [roomName, videoLink, appointmentId]
    );

    res.json({ video_link: videoLink, video_room_name: roomName });
  } catch (err) {
    console.error("Erreur generateTeleconsultation:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};