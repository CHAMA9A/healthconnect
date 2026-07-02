import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PatientAIHistory = () => {
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ai/history");
      setDiagnoses(res.data);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

  return (
    <div className="ai-history-page" style={{
      maxWidth: "720px",
      margin: "0 auto",
    }}>
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
          📋
        </div>
        <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "24px" }}>
          Historique des pré-diagnostics
        </h2>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
          Consultez l'ensemble de vos analyses précédentes
        </p>
      </div>

      {/* Bouton retour */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/patient/ai-assistant")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            color: "#667eea",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          ← Retour à l'assistant
        </button>
      </div>

      {loading ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#666",
        }}>
          <div className="spinner" style={{
            display: "inline-block",
            width: "32px",
            height: "32px",
            border: "3px solid #e0e0e0",
            borderTopColor: "#667eea",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
            marginBottom: "12px",
          }} />
          <p style={{ margin: 0, fontSize: "14px" }}>Chargement de l'historique...</p>
        </div>
      ) : diagnoses.length === 0 ? (
        <div className="ai-empty" style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "14px",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "18px" }}>
            Aucun pré-diagnostic
          </h3>
          <p style={{ margin: "0 0 20px", color: "#666", fontSize: "14px" }}>
            Vous n'avez pas encore réalisé d'analyse de symptômes.
          </p>
          <button
            onClick={() => navigate("/patient/ai-assistant")}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Faire une analyse
          </button>
        </div>
      ) : (
        <div className="ai-history-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {diagnoses.map((diag) => {
            const riskColor = getRiskColor(diag.risk_level);
            const riskBg = getRiskBg(diag.risk_level);
            const isSelected = selected === diag.id;
            const symptoms = typeof diag.symptoms === "string" ? JSON.parse(diag.symptoms) : diag.symptoms;

            return (
              <div
                key={diag.id}
                className="ai-history-card"
                style={{
                  background: "#fff",
                  border: isSelected ? `2px solid ${riskColor}` : "1px solid #e0e0e0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onClick={() => setSelected(isSelected ? null : diag.id)}
              >
                {/* Résumé */}
                <div style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: riskBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}>
                    {diag.risk_level === "LOW" ? "✅" : diag.risk_level === "MEDIUM" ? "⚠️" : "🚨"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "4px",
                    }}>
                      <span style={{
                        padding: "2px 10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: riskBg,
                        color: riskColor,
                      }}>
                        Risque {getRiskLabel(diag.risk_level)}
                      </span>
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        {diag.created_at}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#555",
                      lineHeight: "1.4",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {diag.suggestion}
                    </p>
                  </div>
                  <div style={{ color: "#bbb", fontSize: "12px", flexShrink: 0 }}>
                    {isSelected ? "▲" : "▼"}
                  </div>
                </div>

                {/* Détail (expand) */}
                {isSelected && (
                  <div style={{
                    padding: "0 20px 16px",
                    borderTop: "1px solid #f0f0f0",
                  }}>
                    <div style={{ padding: "12px 0" }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: "12px", color: "#999", fontWeight: 600 }}>
                        SYMPTÔMES
                      </h4>
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}>
                        {symptoms.fievre === "oui" && <SymptomTag label="Fièvre" />}
                        {symptoms.toux === "oui" && <SymptomTag label="Toux" />}
                        {symptoms.fatigue === "oui" && <SymptomTag label="Fatigue" />}
                        {symptoms.douleur === "oui" && <SymptomTag label={`Douleur (${symptoms.intensite_douleur}/10)`} />}
                        {symptoms.difficulte_respiratoire === "oui" && <SymptomTag label="Difficulté respiratoire" />}
                        {symptoms.maladie_chronique === "oui" && <SymptomTag label="Maladie chronique" />}
                        {parseInt(symptoms.duree_jours) > 0 && <SymptomTag label={`${symptoms.duree_jours} jours`} />}
                        {parseInt(symptoms.age) > 0 && <SymptomTag label={`Âge: ${symptoms.age} ans`} />}
                      </div>
                    </div>

                    <div style={{ padding: "8px 0" }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: "12px", color: "#999", fontWeight: 600 }}>
                        RECOMMANDATION
                      </h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                        {diag.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Petit composant pour les tags de symptômes
const SymptomTag = ({ label }) => (
  <span style={{
    padding: "4px 10px",
    background: "#f0f0f5",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#555",
    fontWeight: 500,
  }}>
    {label}
  </span>
);

export default PatientAIHistory;