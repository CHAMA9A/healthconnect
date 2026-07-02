import React, { useState, useEffect } from "react";
import api from "../api/axios";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleValidate = async (id, isValidated) => {
    try {
      const res = await api.put(`/admin/doctors/${id}/validate`, { isValidated });
      setMessage({ type: "success", text: res.data.message });
      fetchDoctors();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  return (
    <div className="page-content">
      <h1>Gestion des médecins</h1>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : doctors.length === 0 ? (
        <p className="text-muted">Aucun médecin inscrit.</p>
      ) : (
        <div className="admin-doctors-list">
          {doctors.map((doc) => (
            <div key={doc.id} className={`admin-doctor-card ${doc.is_validated ? "" : "pending"}`}>
              <div className="admin-doctor-info">
                <h3>Dr {doc.first_name} {doc.last_name}</h3>
                <p>{doc.speciality}</p>
                <p className="text-muted">{doc.email}</p>
                <p className="text-muted">{doc.address}</p>
              </div>
              <div className="admin-doctor-status">
                <span className={`badge-${doc.is_validated ? "available" : "booked"}`}>
                  {doc.is_validated ? "Validé" : "En attente"}
                </span>
              </div>
              <div className="admin-doctor-actions">
                {!doc.is_validated ? (
                  <button className="btn btn-primary btn-sm" onClick={() => handleValidate(doc.id, true)}>
                    Valider
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" style={{ borderColor: "#dc2626", color: "#dc2626" }} onClick={() => handleValidate(doc.id, false)}>
                    Désactiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;