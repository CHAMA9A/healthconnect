const pool = require("../config/database");

class Teleconsultation {
  // Vérifier l'accès à une téléconsultation
  static async checkAccess(appointmentId, userId, userRole) {
    const result = await pool.query(
      `SELECT a.*,
              doc.id as doctor_record_id,
              doc.speciality,
              u_doc.first_name as doctor_first_name,
              u_doc.last_name as doctor_last_name,
              u_doc.id as doctor_user_id,
              u_pat.first_name as patient_first_name,
              u_pat.last_name as patient_last_name,
              u_pat.id as patient_user_id
       FROM appointments a
       JOIN doctors doc ON doc.id = a.doctor_id
       JOIN users u_doc ON u_doc.id = doc.user_id
       JOIN users u_pat ON u_pat.id = a.patient_id
       WHERE a.id = $1`,
      [appointmentId]
    );

    const apt = result.rows[0];
    if (!apt) return { allowed: false, reason: "Rendez-vous introuvable" };

    // Vérifier le rôle et l'appartenance
    if (userRole === "PATIENT" && apt.patient_user_id !== userId) {
      return { allowed: false, reason: "Accès non autorisé" };
    }
    if (userRole === "DOCTOR" && apt.doctor_user_id !== userId) {
      return { allowed: false, reason: "Accès non autorisé" };
    }
    if (userRole === "ADMIN") {
      return { allowed: false, reason: "Accès non autorisé" };
    }

    // Vérifier le statut
    if (apt.status === "CANCELLED") {
      return { allowed: false, reason: "Ce rendez-vous a été annulé" };
    }
    if (apt.status === "PENDING") {
      return { allowed: false, reason: "Ce rendez-vous n'a pas encore été confirmé" };
    }

    return { allowed: true, appointment: apt };
  }

  // Récupérer les infos de téléconsultation
  static async getInfo(appointmentId) {
    const result = await pool.query(
      `SELECT a.id, a.video_link, a.video_room_name, a.video_created_at,
              a.status, a.date, a.start_time, a.end_time,
              u_doc.first_name as doctor_first_name, u_doc.last_name as doctor_last_name,
              u_pat.first_name as patient_first_name, u_pat.last_name as patient_last_name
       FROM appointments a
       JOIN doctors doc ON doc.id = a.doctor_id
       JOIN users u_doc ON u_doc.id = doc.user_id
       JOIN users u_pat ON u_pat.id = a.patient_id
       WHERE a.id = $1`,
      [appointmentId]
    );
    return result.rows[0] || null;
  }
}

module.exports = Teleconsultation;