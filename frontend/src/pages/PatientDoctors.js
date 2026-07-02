import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const specialityColors = {
  "Généraliste": "#e8f5e9",
  "Cardiologue": "#fce4ec",
  "Dermatologue": "#fff3e0",
  "Pédiatre": "#e3f2fd",
  "Ophtalmologue": "#f3e5f5",
  "Neurologue": "#e0f7fa",
  default: "#f0f2f5",
};

const specialityTextColors = {
  "Généraliste": "#2e7d32",
  "Cardiologue": "#c62828",
  "Dermatologue": "#e65100",
  "Pédiatre": "#1565c0",
  "Ophtalmologue": "#7b1fa2",
  "Neurologue": "#00838f",
  default: "#050505",
};

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async (query) => {
    try {
      setLoading(true);
      const params = query ? { search: query } : {};
      const res = await api.get("/doctors", { params });
      setDoctors(res.data);
    } catch (err) {
      console.error("Erreur chargement médecins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  const getInitials = (first, last) => {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  };

  const getBgColor = (speciality) => {
    return specialityColors[speciality] || specialityColors.default;
  };

  const getTextColor = (speciality) => {
    return specialityTextColors[speciality] || specialityTextColors.default;
  };

  return (
    <div className="patient-doctors-page">
      <div className="doctors-header">
        <div>
          <h1>Rechercher un médecin</h1>
          <p className="doctors-subtitle">Trouvez le professionnel de santé qu'il vous faut</p>
        </div>
      </div>

      <form className="doctors-search" onSubmit={handleSearch}>
        <div className="doctors-search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-search">Rechercher</button>
      </form>

      {loading ? (
        <div className="doctors-loading">
          <div className="spinner" />
          <p>Recherche des médecins…</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="doctors-empty">
          <div className="doctors-empty-icon">🔍</div>
          <p className="doctors-empty-title">Aucun médecin trouvé</p>
          <p className="doctors-empty-subtitle">Essayez de modifier votre recherche</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => {
            const initials = getInitials(doc.first_name, doc.last_name);
            const bgColor = getBgColor(doc.speciality);
            const textColor = getTextColor(doc.speciality);
            return (
              <Link to={`/patient/doctors/${doc.id}`} key={doc.id} className="doctor-card-new">
                <div className="doctor-card-avatar" style={{ backgroundColor: bgColor, color: textColor }}>
                  {initials}
                </div>
                <div className="doctor-card-body">
                  <div className="doctor-card-top">
                    <h3 className="doctor-card-name">Dr {doc.first_name} {doc.last_name}</h3>
                    <span className="doctor-card-speciality" style={{ backgroundColor: bgColor, color: textColor }}>
                      {doc.speciality}
                    </span>
                  </div>
                  {doc.address && (
                    <div className="doctor-card-address">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{doc.address}</span>
                    </div>
                  )}
                </div>
                <div className="doctor-card-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;