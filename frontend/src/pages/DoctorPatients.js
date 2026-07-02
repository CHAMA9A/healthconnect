import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const avatarColors = [
  { bg: "#e8f5e9", text: "#2e7d32" },
  { bg: "#fce4ec", text: "#c62828" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#f3e5f5", text: "#7b1fa2" },
  { bg: "#e0f7fa", text: "#00838f" },
];

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/medical-records/doctors/patients");
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const getInitials = (first, last) => {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  };

  const getColor = (index) => avatarColors[index % avatarColors.length];

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="doc-patients-page">
        <div className="doc-patients-loading">
          <div className="spinner" />
          <p>Chargement de vos patients…</p>
        </div>
      </div>
    );

  return (
    <div className="doc-patients-page">
      <div className="doc-patients-header">
        <div>
          <h1>Mes patients</h1>
          <p className="doc-patients-subtitle">
            {patients.length} patient{patients.length > 1 ? "s" : ""} avec qui vous avez eu un rendez-vous
          </p>
        </div>
      </div>

      <div className="doc-patients-search">
        <div className="doc-patients-search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="doc-patients-empty">
          <div className="doc-patients-empty-icon">👥</div>
          <p className="doc-patients-empty-title">
            {patients.length === 0 ? "Aucun patient pour le moment" : "Aucun résultat"}
          </p>
          <p className="doc-patients-empty-subtitle">
            {patients.length === 0
              ? "Les patients apparaissent après un rendez-vous confirmé."
              : "Essayez de modifier votre recherche."}
          </p>
        </div>
      ) : (
        <div className="doc-patients-grid">
          {filteredPatients.map((p, idx) => {
            const initials = getInitials(p.first_name, p.last_name);
            const { bg, text } = getColor(idx);
            return (
              <Link
                key={p.id}
                to={`/doctor/patients/${p.id}/medical-record`}
                className="doc-patient-card"
              >
                <div className="doc-patient-avatar" style={{ backgroundColor: bg, color: text }}>
                  {initials}
                </div>
                <div className="doc-patient-body">
                  <h3 className="doc-patient-name">{p.first_name} {p.last_name}</h3>
                  <div className="doc-patient-email">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    {p.email}
                  </div>
                  <div className="doc-patient-stats">
                    <span className="doc-patient-stat">
                      <strong>{p.completed_count}</strong> consultation{p.completed_count > 1 ? "s" : ""}
                    </span>
                    {p.last_appointment && (
                      <>
                        <span className="doc-patient-stat-sep">·</span>
                        <span className="doc-patient-stat">
                          Dernière visite : {new Date(p.last_appointment).toLocaleDateString("fr-FR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="doc-patient-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default DoctorPatients;