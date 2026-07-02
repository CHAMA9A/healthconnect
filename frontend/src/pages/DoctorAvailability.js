import React, { useState, useEffect } from "react";
import api from "../api/axios";

const DoctorAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "" });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const fetchAvailabilities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/availabilities/mine");
      setAvailabilities(res.data);
    } catch (err) {
      console.error("Erreur chargement disponibilités:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvailabilities(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/availabilities", form);
      setMessage({ type: "success", text: "Créneau ajouté" });
      setForm({ date: "", start_time: "", end_time: "" });
      fetchAvailabilities();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const startEdit = (av) => {
    setEditing(av.id);
    setForm({ date: av.date, start_time: av.start_time, end_time: av.end_time });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.put(`/availabilities/${editing}`, form);
      setMessage({ type: "success", text: "Créneau modifié" });
      setEditing(null);
      setForm({ date: "", start_time: "", end_time: "" });
      fetchAvailabilities();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try {
      await api.delete(`/availabilities/${id}`);
      setMessage({ type: "success", text: "Créneau supprimé" });
      fetchAvailabilities();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  if (loading) return <div className="loading-screen">Chargement…</div>;

  return (
    <div className="page-content">
      <h1>Mes disponibilités</h1>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="avail-form" onSubmit={editing ? handleUpdate : handleAdd}>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Début</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Fin</label>
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          {editing ? "Modifier" : "Ajouter"}
        </button>
        {editing && (
          <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setForm({ date: "", start_time: "", end_time: "" }); }}>
            Annuler
          </button>
        )}
      </form>

      <h2 style={{ marginTop: "2rem" }}>Créneaux enregistrés</h2>
      {availabilities.length === 0 ? (
        <p className="text-muted">Aucun créneau ajouté.</p>
      ) : (
        <div className="avail-list">
          {availabilities.map((av) => (
            <div key={av.id} className="avail-item">
              <span>{new Date(av.date).toLocaleDateString("fr-FR")}</span>
              <span>{av.start_time?.slice(0, 5)} — {av.end_time?.slice(0, 5)}</span>
              {av.is_available ? <span className="badge-available">Disponible</span> : <span className="badge-booked">Réservé</span>}
              <div className="avail-actions">
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(av)}>Modifier</button>
                <button className="btn btn-outline btn-sm" style={{ borderColor: "#dc2626", color: "#dc2626" }} onClick={() => handleDelete(av.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;