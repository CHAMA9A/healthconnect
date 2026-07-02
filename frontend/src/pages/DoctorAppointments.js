import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const statusLabels = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

const statusColors = {
  PENDING: "#f59e0b",
  CONFIRMED: "#059669",
  CANCELLED: "#dc2626",
  COMPLETED: "#6b7280",
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleConfirm = async (id) => {
    try {
      await api.put(`/appointments/${id}/confirm`);
      setMessage({ type: "success", text: "Rendez-vous confirmé" });
      fetchAppointments();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      setMessage({ type: "success", text: "Rendez-vous terminé" });
      fetchAppointments();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  return (
    <div className="page-content">
      <h1>Rendez-vous reçus</h1>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted">Aucun rendez-vous.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="apt-header">
                <span className="apt-patient">{apt.patient_first_name} {apt.patient_last_name}</span>
                <span className="apt-status" style={{ color: statusColors[apt.status], fontWeight: 600 }}>
                  {statusLabels[apt.status]}
                </span>
              </div>
              <p className="apt-date">
                {new Date(apt.date).toLocaleDateString("fr-FR")} — {apt.start_time?.slice(0, 5)} à {apt.end_time?.slice(0, 5)}
              </p>
              <p className="apt-reason">{apt.reason}</p>
              <p className="text-muted">{apt.patient_email}</p>

              {apt.status === "CANCELLED" && apt.cancellation_reason && (
                <p className="apt-cancel-reason">Annulation : {apt.cancellation_reason}</p>
              )}

              {apt.status === "PENDING" && (
                <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(apt.id)}>
                  Confirmer
                </button>
              )}
              {apt.status === "CONFIRMED" && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)", border: "none" }}
                  onClick={() => navigate(`/teleconsultation/${apt.id}`)}
                >
                  🎥 Démarrer la téléconsultation
                </button>
              )}
              {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                <button className="btn btn-outline btn-sm" style={{ marginLeft: "0.5rem" }} onClick={() => handleComplete(apt.id)}>
                  Terminer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;