const Message = require("../models/Message");
const pool = require("../config/database");

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    console.error("Erreur getConversations:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/messages/conversation/:appointmentId
exports.getConversation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    // Vérifier que le rendez-vous existe et que l'utilisateur y participe
    const apptCheck = await pool.query(
      `SELECT a.id FROM appointments a
       LEFT JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = $1 AND (a.patient_id = $2 OR d.user_id = $2)`,
      [appointmentId, req.user.id]
    );
    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ message: "Conversation introuvable" });
    }
    const messages = await Message.getByAppointment(appointmentId, req.user.id);
    res.json(messages);
  } catch (err) {
    console.error("Erreur getConversation:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/messages
exports.create = async (req, res) => {
  try {
    const { appointment_id, content } = req.body;
    if (!appointment_id || !content) {
      return res.status(400).json({ message: "appointment_id et content requis" });
    }

    // Vérifier que l'utilisateur participe à ce rendez-vous
    const apptCheck = await pool.query(
      `SELECT a.id, a.status FROM appointments a
       LEFT JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = $1 AND (a.patient_id = $2 OR d.user_id = $2)`,
      [appointment_id, req.user.id]
    );
    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }
    if (apptCheck.rows[0].status === "PENDING") {
      return res.status(400).json({ message: "Le rendez-vous doit être confirmé pour envoyer des messages" });
    }

    const message = await Message.create({
      appointmentId: appointment_id,
      senderId: req.user.id,
      content,
    });
    res.status(201).json({ message: "Message envoyé", data: message });
  } catch (err) {
    console.error("Erreur createMessage:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};