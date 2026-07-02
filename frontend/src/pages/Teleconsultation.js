import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Teleconsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIframe, setShowIframe] = useState(false);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teleconsultation/${appointmentId}`);
      setInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="page-content" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="spinner" />
        <p style={{ color: "#666", marginTop: "12px" }}>Chargement de la téléconsultation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
        <h2 style={{ color: "#dc2626", margin: "0 0 8px" }}>Accès refusé</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate(-1)}
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
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="teleconsultation-container" style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        {/* En-tête */}
        <div className="teleconsultation-header" style={{
          textAlign: "center",
          marginBottom: "28px",
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 16px",
          }}>
            🎥
          </div>
          <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "22px" }}>
            Téléconsultation
          </h2>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Salon de consultation à distance sécurisé
          </p>
        </div>

        {/* Carte d'information */}
        <div className="teleconsultation-card" style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "24px",
        }}>
          <div className="teleconsultation-info" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}>
            <div>
              <span style={{ fontSize: "12px", color: "#999", fontWeight: 600 }}>PATIENT</span>
              <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e" }}>
                {info.patient_first_name} {info.patient_last_name}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#999", fontWeight: 600 }}>MÉDECIN</span>
              <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e" }}>
                Dr {info.doctor_first_name} {info.doctor_last_name}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#999", fontWeight: 600 }}>DATE</span>
              <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e" }}>
                {new Date(info.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#999", fontWeight: 600 }}>HORAIRE</span>
              <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e" }}>
                {info.start_time?.slice(0, 5)} — {info.end_time?.slice(0, 5)}
              </p>
            </div>
          </div>
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: "12px", color: "#999", fontWeight: 600 }}>STATUT</span>
            <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, color: "#059669" }}>
              {info.status === "CONFIRMED" ? "Confirmé" : info.status}
            </p>
          </div>
        </div>

        {/* Zone vidéo */}
        <div className="teleconsultation-video" style={{
          background: info.video_link ? "#fff" : "#f5f5f5",
          border: `1px solid ${info.video_link ? "#e0e0e0" : "#e0e0e0"}`,
          borderRadius: "14px",
          overflow: "hidden",
          marginBottom: "24px",
        }}>
          {!showIframe ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📹</div>
              <h3 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: "18px" }}>
                Prêt à rejoindre la consultation ?
              </h3>
              <p style={{ margin: "0 0 24px", color: "#666", fontSize: "14px", maxWidth: "400px", margin: "0 auto 24px" }}>
                La salle de téléconsultation est prête. Cliquez sur le bouton ci-dessous pour commencer.
              </p>
              {info.video_link ? (
                <>
                  <button
                    onClick={() => setShowIframe(true)}
                    style={{
                      padding: "14px 32px",
                      fontSize: "16px",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🎥 Rejoindre la téléconsultation
                  </button>
                  <p style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
                    Ou ouvrir dans un nouvel onglet :{" "}
                    <a
                      href={info.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#667eea" }}
                    >
                      {info.video_link}
                    </a>
                  </p>
                </>
              ) : (
                <p style={{ color: "#999" }}>Aucun lien vidéo disponible pour ce rendez-vous.</p>
              )}
            </div>
          ) : (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#1a1a2e",
                color: "#fff",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  🎥 Téléconsultation en cours
                </span>
                <button
                  onClick={() => setShowIframe(false)}
                  style={{
                    padding: "6px 16px",
                    fontSize: "13px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Quitter
                </button>
              </div>
              <iframe
                src={info.video_link}
                title="Téléconsultation Jitsi"
                width="100%"
                height="600px"
                allow="camera; microphone; fullscreen; display-capture"
                style={{ border: "none" }}
              />
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="teleconsultation-disclaimer" style={{
          background: "#fff8e1",
          border: "1px solid #ffe082",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>🔒</span>
          <p style={{ margin: 0, color: "#e65100", fontSize: "13px", lineHeight: "1.5" }}>
            Cette téléconsultation est sécurisée et confidentielle. Seuls le patient et le médecin concernés par ce rendez-vous peuvent y accéder. Ne partagez pas le lien avec des tiers.
          </p>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "none",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Teleconsultation;