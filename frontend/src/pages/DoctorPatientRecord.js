import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const avatarColors = [
  { bg: "#e8f5e9", text: "#2e7d32" },
  { bg: "#fce4ec", text: "#c62828" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#f3e5f5", text: "#7b1fa2" },
];

const DoctorPatientRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState(null);
  const [record, setRecord] = useState(null);
  const [reports, setReports] = useState([]);
  const [results, setResults] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Accordion state
  const [showAddReport, setShowAddReport] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);

  // Forms
  const [reportForm, setReportForm] = useState({ title: "", content: "" });
  const [resultForm, setResultForm] = useState({ title: "", result_value: "", comment: "" });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [recRes, repRes, resRes, docRes] = await Promise.all([
        api.get(`/medical-records/patient/${patientId}`).catch(() => null),
        api.get(`/medical-reports/patient/${patientId}`),
        api.get(`/medical-results/patient/${patientId}`),
        api.get(`/medical-documents/patient/${patientId}`),
      ]);
      setRecord(recRes?.data || null);
      setReports(repRes.data);
      setResults(resRes.data);
      setDocuments(docRes.data);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur de chargement" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch patient info from the patients list
    const fetchPatientInfo = async () => {
      try {
        const res = await api.get("/medical-records/doctors/patients");
        const found = res.data.find((p) => p.id === parseInt(patientId));
        if (found) setPatientInfo(found);
      } catch (_) {}
    };
    fetchPatientInfo();
    fetchAll();
  }, [patientId]);

  const handleAddReport = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/medical-reports", {
        patient_id: parseInt(patientId),
        title: reportForm.title,
        content: reportForm.content,
      });
      setMessage({ type: "success", text: "Compte rendu ajouté" });
      setReportForm({ title: "", content: "" });
      setShowAddReport(false);
      fetchAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/medical-results", {
        patient_id: parseInt(patientId),
        title: resultForm.title,
        result_value: resultForm.result_value,
        comment: resultForm.comment,
      });
      setMessage({ type: "success", text: "Résultat ajouté" });
      setResultForm({ title: "", result_value: "", comment: "" });
      setShowAddResult(false);
      fetchAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  const getInitials = (first, last) => {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  };

  if (loading)
    return (
      <div className="doc-patient-record-page">
        <div className="doc-record-loading">
          <div className="spinner" />
          <p>Chargement du dossier patient…</p>
        </div>
      </div>
    );

  const initials = getInitials(patientInfo?.first_name, patientInfo?.last_name);
  const name = patientInfo
    ? `${patientInfo.first_name} ${patientInfo.last_name}`
    : "Patient";

  return (
    <div className="doc-patient-record-page">
      {/* Back button */}
      <button className="doc-record-back" onClick={() => navigate("/doctor/patients")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Retour à mes patients
      </button>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Patient header */}
      <div className="doc-record-patient-header">
        <div className="doc-record-avatar" style={{ backgroundColor: avatarColors[0].bg, color: avatarColors[0].text }}>
          {initials || "👤"}
        </div>
        <div className="doc-record-patient-info">
          <h1>{name}</h1>
          {patientInfo?.email && (
            <div className="doc-record-email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {patientInfo?.email}
            </div>
          )}
          {patientInfo && (
            <div className="doc-record-stats">
              <span className="doc-record-stat"><strong>{patientInfo.completed_count}</strong> consultation{patientInfo.completed_count > 1 ? "s" : ""}</span>
              {patientInfo.last_appointment && (
                <>
                  <span className="doc-record-stat-sep">·</span>
                  <span className="doc-record-stat">Dernière visite : {new Date(patientInfo.last_appointment).toLocaleDateString("fr-FR")}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="doc-record-grid">
        {/* Left column: Medical record + add forms */}
        <div className="doc-record-left">
          {/* Medical record */}
          <div className="med-card">
            <div className="med-card-header">
              <div className="med-card-header-left">
                <div className="med-card-icon">📋</div>
                <h2>Dossier médical</h2>
              </div>
            </div>
            {record ? (
              <div className="med-info-grid">
                <div className="med-info-item">
                  <div className="med-info-label">Antécédents</div>
                  <div className="med-info-value">{record.history || "Non renseigné"}</div>
                </div>
                <div className="med-info-item">
                  <div className="med-info-label">Allergies</div>
                  <div className="med-info-value">{record.allergies || "Non renseigné"}</div>
                </div>
                <div className="med-info-item">
                  <div className="med-info-label">Traitements</div>
                  <div className="med-info-value">{record.treatments || "Non renseigné"}</div>
                </div>
              </div>
            ) : (
              <div className="med-empty">
                <p>Dossier médical non disponible.</p>
              </div>
            )}
          </div>

          {/* Add report (accordion) */}
          <div className="med-card">
            <button className="med-card-accordion" onClick={() => setShowAddReport(!showAddReport)}>
              <div className="med-card-header-left">
                <div className="med-card-icon">📝</div>
                <h2>Ajouter un compte rendu</h2>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: showAddReport ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            {showAddReport && (
              <form onSubmit={handleAddReport} className="med-card-form">
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    type="text"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Ex: Consultation du 15/06"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contenu</label>
                  <textarea
                    value={reportForm.content}
                    onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                    placeholder="Compte rendu détaillé…"
                    rows={4}
                    required
                  />
                </div>
                <div className="med-form-actions">
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                </div>
              </form>
            )}
          </div>

          {/* Add result (accordion) */}
          <div className="med-card">
            <button className="med-card-accordion" onClick={() => setShowAddResult(!showAddResult)}>
              <div className="med-card-header-left">
                <div className="med-card-icon">🔬</div>
                <h2>Ajouter un résultat</h2>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: showAddResult ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            {showAddResult && (
              <form onSubmit={handleAddResult} className="med-card-form">
                <div className="form-group">
                  <label>Type d'analyse</label>
                  <input
                    type="text"
                    value={resultForm.title}
                    onChange={(e) => setResultForm({ ...resultForm, title: e.target.value })}
                    placeholder="Ex: Glycémie à jeun"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valeur / Résultat</label>
                  <input
                    type="text"
                    value={resultForm.result_value}
                    onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })}
                    placeholder="Ex: 1.05 g/L"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Commentaire (optionnel)</label>
                  <textarea
                    value={resultForm.comment}
                    onChange={(e) => setResultForm({ ...resultForm, comment: e.target.value })}
                    placeholder="Interprétation, remarques…"
                    rows={2}
                  />
                </div>
                <div className="med-form-actions">
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right column: History (reports, results, documents) */}
        <div className="doc-record-right">
          {/* Reports history */}
          <div className="med-card">
            <div className="med-card-header">
              <div className="med-card-header-left">
                <div className="med-card-icon">📄</div>
                <h2>Comptes rendus</h2>
              </div>
              {reports.length > 0 && <span className="med-count-badge">{reports.length}</span>}
            </div>
            {reports.length === 0 ? (
              <div className="med-empty"><p>Aucun compte rendu.</p></div>
            ) : (
              <div className="med-timeline">
                {reports.map((r) => (
                  <div key={r.id} className="med-timeline-item">
                    <div className="med-timeline-dot" />
                    <div className="med-timeline-content">
                      <div className="med-timeline-header">
                        <strong>{r.title}</strong>
                        <span className="med-timeline-meta">Dr {r.doctor_first_name} {r.doctor_last_name}</span>
                      </div>
                      <p className="med-timeline-text">{r.content}</p>
                      <span className="med-timeline-date">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results history */}
          <div className="med-card">
            <div className="med-card-header">
              <div className="med-card-header-left">
                <div className="med-card-icon">🔬</div>
                <h2>Résultats</h2>
              </div>
              {results.length > 0 && <span className="med-count-badge">{results.length}</span>}
            </div>
            {results.length === 0 ? (
              <div className="med-empty"><p>Aucun résultat.</p></div>
            ) : (
              <div className="med-results-grid">
                {results.map((r) => (
                  <div key={r.id} className="med-result-card">
                    <div className="med-result-header">
                      <span className="med-result-title">{r.title}</span>
                      <span className="med-result-value-badge">{r.result_value}</span>
                    </div>
                    <div className="med-result-meta">Dr {r.doctor_first_name} {r.doctor_last_name}</div>
                    {r.comment && <div className="med-result-comment">{r.comment}</div>}
                    <div className="med-result-date">{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="med-card">
            <div className="med-card-header">
              <div className="med-card-header-left">
                <div className="med-card-icon">📎</div>
                <h2>Documents</h2>
              </div>
              {documents.length > 0 && <span className="med-count-badge">{documents.length}</span>}
            </div>
            {documents.length === 0 ? (
              <div className="med-empty"><p>Aucun document.</p></div>
            ) : (
              <div className="med-doc-list">
                {documents.map((d) => (
                  <div key={d.id} className="med-doc-item">
                    <div className="med-doc-icon">📄</div>
                    <div className="med-doc-info">
                      <span className="med-doc-name">{d.file_name}</span>
                      <span className="med-doc-meta">{d.file_type}</span>
                    </div>
                    <span className="med-doc-date">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientRecord;