import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PatientAIAssistant = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fievre: "non",
    toux: "non",
    fatigue: "non",
    douleur: "non",
    intensite_douleur: "1",
    difficulte_respiratoire: "non",
    duree_jours: "",
    age: "",
    maladie_chronique: "non",
    description_libre: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/ai/pre-diagnosis", {
        ...form,
        intensite_douleur: parseInt(form.intensite_douleur) || 0,
        duree_jours: parseInt(form.duree_jours) || 0,
        age: parseInt(form.age) || 0,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setForm({
      fievre: "non",
      toux: "non",
      fatigue: "non",
      douleur: "non",
      intensite_douleur: "1",
      difficulte_respiratoire: "non",
      duree_jours: "",
      age: "",
      maladie_chronique: "non",
      description_libre: "",
    });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "LOW": return "#4caf50";
      case "MEDIUM": return "#ff9800";
      case "HIGH": return "#f44336";
      default: return "#666";
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case "LOW": return "#e8f5e9";
      case "MEDIUM": return "#fff3e0";
      case "HIGH": return "#ffebee";
      default: return "#f5f5f5";
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case "LOW": return "Faible";
      case "MEDIUM": return "Modéré";
      case "HIGH": return "Élevé";
      default: return level;
    }
  };

  const showDouleur = form.douleur === "oui";
  const showIntensite = form.douleur === "oui";

  return (
    <div className="ai-assistant-page" style={{
      maxWidth: "720px",
      margin: "0 auto",
    }}>
      {!result ? (
        <>
          {/* En-tête */}
          <div className="ai-header" style={{
            textAlign: "center",
            marginBottom: "32px",
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
            }}>
              🤖
            </div>
            <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "24px" }}>
              Assistant IA de Pré-Diagnostic
            </h2>
            <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
              Répondez au questionnaire ci-dessous pour obtenir une analyse préliminaire
              de vos symptômes. Ce service est gratuit et confidentiel.
            </p>
          </div>

          {/* Message d'information */}
          <div className="ai-info-banner" style={{
            background: "#e3f2fd",
            border: "1px solid #bbdefb",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "#1565c0",
          }}>
            <span style={{ fontSize: "18px" }}>ℹ️</span>
            <span>
              Ce questionnaire ne remplace en aucun cas une consultation médicale.
              En cas d'urgence, appelez le 15 (SAMU).
            </span>
          </div>

          {error && (
            <div className="ai-error" style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form className="ai-form" onSubmit={handleSubmit}>
            <div className="ai-form-section" style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "20px",
            }}>
              <h3 style={{ margin: "0 0 20px", color: "#1a1a2e", fontSize: "16px", fontWeight: 600 }}>
                Symptômes principaux
              </h3>

              <div className="ai-form-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
                {/* Fièvre */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Fièvre
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.fievre === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.fievre === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.fievre === opt ? 600 : 400,
                        color: form.fievre === opt ? "#667eea" : "#666",
                        transition: "all 0.2s",
                      }}>
                        <input
                          type="radio"
                          name="fievre"
                          value={opt}
                          checked={form.fievre === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toux */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Toux
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.toux === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.toux === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.toux === opt ? 600 : 400,
                        color: form.toux === opt ? "#667eea" : "#666",
                      }}>
                        <input
                          type="radio"
                          name="toux"
                          value={opt}
                          checked={form.toux === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fatigue */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Fatigue
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.fatigue === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.fatigue === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.fatigue === opt ? 600 : 400,
                        color: form.fatigue === opt ? "#667eea" : "#666",
                      }}>
                        <input
                          type="radio"
                          name="fatigue"
                          value={opt}
                          checked={form.fatigue === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Douleur */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Douleur
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.douleur === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.douleur === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.douleur === opt ? 600 : 400,
                        color: form.douleur === opt ? "#667eea" : "#666",
                      }}>
                        <input
                          type="radio"
                          name="douleur"
                          value={opt}
                          checked={form.douleur === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intensité de la douleur (conditionnel) */}
              {showIntensite && (
                <div className="ai-field" style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Intensité de la douleur : <strong>{form.intensite_douleur}/10</strong>
                  </label>
                  <input
                    type="range"
                    name="intensite_douleur"
                    min="1"
                    max="10"
                    value={form.intensite_douleur}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      height: "6px",
                      borderRadius: "3px",
                      accentColor: parseInt(form.intensite_douleur) >= 8 ? "#f44336" : parseInt(form.intensite_douleur) >= 5 ? "#ff9800" : "#4caf50",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999", marginTop: "4px" }}>
                    <span>1 - Légère</span>
                    <span>5 - Modérée</span>
                    <span>10 - Très sévère</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ai-form-section" style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "20px",
            }}>
              <h3 style={{ margin: "0 0 20px", color: "#1a1a2e", fontSize: "16px", fontWeight: 600 }}>
                Informations complémentaires
              </h3>

              <div className="ai-form-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
                {/* Difficulté respiratoire */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Difficulté respiratoire
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.difficulte_respiratoire === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.difficulte_respiratoire === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.difficulte_respiratoire === opt ? 600 : 400,
                        color: form.difficulte_respiratoire === opt ? "#667eea" : "#666",
                      }}>
                        <input
                          type="radio"
                          name="difficulte_respiratoire"
                          value={opt}
                          checked={form.difficulte_respiratoire === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Maladie chronique */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Maladie chronique
                  </label>
                  <div className="ai-radio-group" style={{ display: "flex", gap: "8px" }}>
                    {["oui", "non"].map((opt) => (
                      <label key={opt} className="ai-radio-label" style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: form.maladie_chronique === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
                        background: form.maladie_chronique === opt ? "#eef0ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: form.maladie_chronique === opt ? 600 : 400,
                        color: form.maladie_chronique === opt ? "#667eea" : "#666",
                      }}>
                        <input
                          type="radio"
                          name="maladie_chronique"
                          value={opt}
                          checked={form.maladie_chronique === opt}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        {opt === "oui" ? "Oui" : "Non"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Durée des symptômes */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Durée des symptômes (jours)
                  </label>
                  <input
                    type="number"
                    name="duree_jours"
                    value={form.duree_jours}
                    onChange={handleChange}
                    min="0"
                    max="365"
                    placeholder="Ex: 3"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                {/* Âge */}
                <div className="ai-field">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                    Votre âge
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    placeholder="Ex: 30"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>

              {/* Description libre */}
              <div className="ai-field" style={{ marginTop: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                  Description libre de vos symptômes (optionnel)
                </label>
                <textarea
                  name="description_libre"
                  value={form.description_libre}
                  onChange={handleChange}
                  placeholder="Décrivez vos symptômes en quelques mots..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: 600,
                background: loading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <span>
                  <span className="spinner" style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    marginRight: "8px",
                    verticalAlign: "middle",
                  }} />
                  Analyse en cours...
                </span>
              ) : (
                "Analyser mes symptômes"
              )}
            </button>
          </form>
        </>
      ) : (
        /* Résultat */
        <div className="ai-result-container">
          <div className="ai-result-header" style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: getRiskBg(result.risk_level),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              margin: "0 auto 16px",
              border: `3px solid ${getRiskColor(result.risk_level)}`,
            }}>
              {result.risk_level === "LOW" ? "✅" : result.risk_level === "MEDIUM" ? "⚠️" : "🚨"}
            </div>
            <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "22px" }}>
              Résultat de l'analyse
            </h2>
          </div>

          {/* Niveau de risque */}
          <div className="ai-risk-badge" style={{
            textAlign: "center",
            marginBottom: "24px",
          }}>
            <span style={{
              display: "inline-block",
              padding: "8px 24px",
              borderRadius: "20px",
              background: getRiskBg(result.risk_level),
              color: getRiskColor(result.risk_level),
              fontWeight: 700,
              fontSize: "16px",
              border: `2px solid ${getRiskColor(result.risk_level)}`,
            }}>
              Risque {getRiskLabel(result.risk_level)}
            </span>
          </div>

          {/* Suggestion */}
          <div className="ai-result-card" style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <h4 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "14px", fontWeight: 600 }}>
              Hypothèse indicative
            </h4>
            <p style={{ margin: 0, color: "#444", fontSize: "14px", lineHeight: "1.6" }}>
              {result.suggestion}
            </p>
          </div>

          {/* Recommandation */}
          <div className="ai-result-card" style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <h4 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "14px", fontWeight: 600 }}>
              Recommandation
            </h4>
            <p style={{ margin: 0, color: "#444", fontSize: "14px", lineHeight: "1.6" }}>
              {result.recommendation}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="ai-disclaimer" style={{
            background: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚖️</span>
            <p style={{ margin: 0, color: "#e65100", fontSize: "13px", lineHeight: "1.5" }}>
              {result.disclaimer}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={resetForm}
              className="btn btn-outline"
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "14px",
                fontWeight: 600,
                background: "#fff",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Nouvelle analyse
            </button>
            <button
              onClick={() => navigate("/patient/ai-history")}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "14px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Voir l'historique
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAIAssistant;