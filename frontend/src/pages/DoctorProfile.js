import React, { useState, useEffect } from "react";
import api from "../api/axios";

const DoctorProfile = () => {
  const [form, setForm] = useState({
    speciality: "Généraliste",
    description: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/doctors/me");
        if (res.data) {
          setForm({
            speciality: res.data.speciality || "Généraliste",
            description: res.data.description || "",
            address: res.data.address || "",
            phone: res.data.phone || "",
          });
        }
      } catch (err) {
        // Pas encore de profil
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put("/doctors/profile", form);
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen">Chargement…</div>;

  return (
    <div className="page-content">
      <h1>Mon profil médecin</h1>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Spécialité</label>
          <select name="speciality" value={form.speciality} onChange={handleChange}>
            <option value="Généraliste">Généraliste</option>
            <option value="Cardiologue">Cardiologue</option>
            <option value="Dermatologue">Dermatologue</option>
            <option value="Pédiatre">Pédiatre</option>
            <option value="Ophtalmologue">Ophtalmologue</option>
            <option value="Gynécologue">Gynécologue</option>
            <option value="Neurologue">Neurologue</option>
            <option value="Psychiatre">Psychiatre</option>
            <option value="Radiologue">Radiologue</option>
            <option value="Chirurgien">Chirurgien</option>
            <option value="Orthopédiste">Orthopédiste</option>
            <option value="ORL">ORL</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Présentez votre cabinet, votre parcours…"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Adresse du cabinet</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 rue de la Santé, 75000 Paris"
          />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="01 23 45 67 89"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;