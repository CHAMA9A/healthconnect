import React, { useState, useEffect } from "react";
import api from "../api/axios";

const statusLabels = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

const statusColors = {
  PENDING: { bg: "#fff8e1", text: "#f57f17", dot: "#f59e0b" },
  CONFIRMED: { bg: "#e8f5e9", text: "#2e7d32", dot: "#31a24c" },
  CANCELLED: { bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
  COMPLETED: { bg: "#f0f2f5", text: "#65676b", dot: "#9ca3af" },
};

const tabs = [
  { key: "all", label: "Tous" },
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "cancelled", label: "Annulés" },
];

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", start_time: "", end_time: "", reason: "" });
  const [cancelling, setCancelling] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/patient");
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const startEdit = (apt) => {
    setEditing(apt.id);
    setEditForm({
      date: apt.date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      reason: apt.reason || "",
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/${editing}`, editForm);
      setMessage({ type: "success", text: "Rendez-vous modifié" });
      setEditing(null);
      fetchAppointments();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/appointments/${id}`, { data: { reason: cancelReason } });
      setMessage({ type: "success", text: "Rendez-vous annulé" });
      setCancelling(null);
      setCancelReason("");
      fetchAppointments();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const canEdit = (status) => status === "PENDING" || status === "CONFIRMED";

  const filteredAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0];
    switch (activeTab) {
      case "upcoming":
        return apt.date >= today && apt.status !== "CANCELLED" && apt.status !== "COMPLETED";
      case "past":
        return apt.date < today || apt.status === "COMPLETED";
      case "cancelled":
        return apt.status === "CANCELLED";
      default:
        return true;
    }
  });

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1>Mes rendez-vous</h1>
          <p className="appointments-subtitle">
            {appointments.length} rendez-vous au total
          </p>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Tabs */}
      <div className="appointments-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`appt-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="appt-list">
        {loading ? (
          <div className="appt-loading">
            <div className="spinner" />
            <p>Chargement de vos rendez-vous…</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="appt-empty">
            <div className="appt-empty-icon">📅</div>
            <p className="appt-empty-title">Aucun rendez-vous</p>
            <p className="appt-empty-subtitle">
              {activeTab === "all"
                ? "Vous n'avez pas encore de rendez-vous."
                : "Aucun rendez-vous dans cette catégorie."}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const sc = statusColors[apt.status] || statusColors.PENDING;
            return (
              <div key={apt.id} className="appt-card">
                <div className="appt-card-main">
                  <div className="appt-card-left">
                    <div className="appt-date-badge">
                      <span className="appt-date-day">
                        {new Date(apt.date).getDate()}
                      </span>
                      <span className="appt-date-month">
                        {new Date(apt.date).toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                    </div>
                  </div>
                  <div className="appt-card-body">
                    <div className="appt-card-top">
                      <h3>Dr {apt.doctor_first_name} {apt.doctor_last_name}</h3>
                      <span className="appt-status-badge" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        <span className="appt-status-dot" style={{ backgroundColor: sc.dot }} />
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                    <div className="appt-card-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      {apt.start_time?.slice(0, 5)} — {apt.end_time?.slice(0, 5)}
                    </div>
                    {apt.reason && (
                      <div className="appt-card-reason">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span>{apt.reason}</span>
                      </div>
                    )}
                    <div className="appt-card-address">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{apt.doctor_address || "Adresse non renseignée"}</span>
                    </div>
                    {apt.status === "CANCELLED" && apt.cancellation_reason && (
                      <div className="appt-card-cancel-reason">
                        Raison : {apt.cancellation_reason}
                      </div>
                    )}
                  </div>
                  {canEdit(apt.status) && (
                    <div className="appt-card-actions">
                      <button className="appt-action-btn edit" onClick={() => startEdit(apt)} title="Modifier">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </button>
                      <button className="appt-action-btn cancel" onClick={() => { setCancelling(apt.id); setCancelReason(""); }} title="Annuler">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit form */}
                {editing === apt.id && (
                  <form className="appt-edit-form" onSubmit={handleEdit}>
                    <div className="appt-edit-grid">
                      <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Début</label>
                        <input type="time" value={editForm.start_time} onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Fin</label>
                        <input type="time" value={editForm.end_time} onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Motif</label>
                      <textarea value={editForm.reason} onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })} rows={2} />
                    </div>
                    <div className="appt-edit-actions">
                      <button type="submit" className="btn btn-primary btn-sm">Enregistrer</button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Annuler</button>
                    </div>
                  </form>
                )}

                {/* Cancel form */}
                {cancelling === apt.id && (
                  <div className="appt-cancel-form">
                    <div className="form-group">
                      <label>Raison de l'annulation</label>
                      <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Raison (optionnelle)" rows={2} />
                    </div>
                    <div className="appt-edit-actions">
                      <button className="btn btn-primary btn-sm" style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
                        onClick={() => handleCancel(apt.id)}>Confirmer l'annulation</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setCancelling(null)}>Retour</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;