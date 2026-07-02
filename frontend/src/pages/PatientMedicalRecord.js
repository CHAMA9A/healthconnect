import React, { useState, useEffect } from "react";
import api from "../api/axios";

const PatientMedicalRecord = () => {
  const [record, setRecord] = useState(null);
  const [reports, setReports] = useState([]);
  const [results, setResults] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ history: "", allergies: "", treatments: "" });
  const [message, setMessage] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      const [recRes, repRes, resRes, docRes] = await Promise.all([
        api.get("/medical-records/me"),
        api.get(`/medical-reports/patient/${userId}`),
        api.get(`/medical-results/patient/${userId}`),
        api.get(`/medical-documents/patient/${userId}`),
      ]);
      setRecord(recRes.data);
      setForm({
        history: recRes.data.history || "",
        allergies: recRes.data.allergies || "",
        treatments: recRes.data.treatments || "",
      });
      setReports(repRes.data);
      setResults(resRes.data);
      setDocuments(docRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.put("/medical-records/me", form);
      setRecord(res.data.record);
      setEditing(false);
      setMessage({ type: "success", text: "Dossier médical mis à jour" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur" });
    }
  };

  if (loading)
    return (
      <div className="med-record-page">
        <div className="med-record-loading">
          <div className="spinner" />
          <p>Chargement du dossier médical…</p>
        </div>
      </div>
    );

  return (
    <div className="med-record-page">
      <div className="med-record-header">
        <h1>Mon dossier médical</h1>
        <p className="med-record-subtitle">Gérez vos informations médicales et consultez votre historique</p>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Medical info card */}
      <div className="med-card">
        <div className="med-card-header">
          <div className="med-card-header-left">
            <div className="med-card-icon">📋</div>
            <h2>Informations médicales</h2>
          </div>
          {!editing && (
            <button className="btn-edit" onClick={() => setEditing(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
              Modifier
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="med-card-form">
            <div className="form-group">
              <label>Antécédents médicaux</label>
              <textarea
                value={form.history}
                onChange={(e) => setForm({ ...form, history: e.target.value })}
                placeholder="Historique médical…"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Allergies connues…"
                rows={2}
              />
            </div>
            <div className="form-group">
              <label>Traitements en cours</label>
              <textarea
                value={form.treatments}
                onChange={(e) => setForm({ ...form, treatments: e.target.value })}
                placeholder="Traitements en cours…"
                rows={2}
              />
            </div>
            <div className="med-form-actions">
              <button type="submit" className="btn btn-primary">Enregistrer</button>
              <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setForm({ history: record?.history || "", allergies: record?.allergies || "", treatments: record?.treatments || "" }); }}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="med-info-grid">
            <div className="med-info-item">
              <div className="med-info-label">Antécédents médicaux</div>
              <div className="med-info-value">{record?.history || "Aucun antécédent renseigné"}</div>
            </div>
            <div className="med-info-item">
              <div className="med-info-label">Allergies</div>
              <div className="med-info-value">{record?.allergies || "Aucune allergie renseignée"}</div>
            </div>
            <div className="med-info-item">
              <div className="med-info-label">Traitements en cours</div>
              <div className="med-info-value">{record?.treatments || "Aucun traitement renseigné"}</div>
            </div>
          </div>
        )}
      </div>

      {/* Reports */}
      <div className="med-card">
        <div className="med-card-header">
          <div className="med-card-header-left">
            <div className="med-card-icon">📄</div>
            <h2>Comptes rendus</h2>
          </div>
          {reports.length > 0 && (
            <span className="med-count-badge">{reports.length}</span>
          )}
        </div>
        {reports.length === 0 ? (
          <div className="med-empty">
            <p>Aucun compte rendu pour le moment.</p>
          </div>
        ) : (
          <div className="med-timeline">
            {reports.map((r) => (
              <div key={r.id} className="med-timeline-item">
                <div className="med-timeline-dot" />
                <div className="med-timeline-content">
                  <div className="med-timeline-header">
                    <strong>{r.title}</strong>
                    <span className="med-timeline-meta">
                      Dr {r.doctor_first_name} {r.doctor_last_name}
                    </span>
                  </div>
                  <p className="med-timeline-text">{r.content}</p>
                  <span className="med-timeline-date">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="med-card">
        <div className="med-card-header">
          <div className="med-card-header-left">
            <div className="med-card-icon">🔬</div>
            <h2>Résultats médicaux</h2>
          </div>
          {results.length > 0 && (
            <span className="med-count-badge">{results.length}</span>
          )}
        </div>
        {results.length === 0 ? (
          <div className="med-empty">
            <p>Aucun résultat pour le moment.</p>
          </div>
        ) : (
          <div className="med-results-grid">
            {results.map((r) => (
              <div key={r.id} className="med-result-card">
                <div className="med-result-header">
                  <span className="med-result-title">{r.title}</span>
                  <span className="med-result-value-badge">{r.result_value}</span>
                </div>
                <div className="med-result-meta">
                  Dr {r.doctor_first_name} {r.doctor_last_name}
                </div>
                {r.comment && <div className="med-result-comment">{r.comment}</div>}
                <div className="med-result-date">
                  {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </div>
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
          {documents.length > 0 && (
            <span className="med-count-badge">{documents.length}</span>
          )}
        </div>
        {documents.length === 0 ? (
          <div className="med-empty">
            <p>Aucun document pour le moment.</p>
          </div>
        ) : (
          <div className="med-doc-list">
            {documents.map((d) => (
              <div key={d.id} className="med-doc-item">
                <div className="med-doc-icon">📄</div>
                <div className="med-doc-info">
                  <span className="med-doc-name">{d.file_name}</span>
                  <span className="med-doc-meta">{d.file_type}</span>
                </div>
                <span className="med-doc-date">
                  {new Date(d.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecord;