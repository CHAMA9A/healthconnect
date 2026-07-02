import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ============================================================
// Tous les styles sont en INLINE pour tester le rendu
// ============================================================

// Palette
const C = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  white: "#ffffff",
  bg: "#f0f4fc",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  shadow: "0 1px 3px rgba(0,0,0,0.1)",
  radius: "12px",
};

// Styles globaux pour le test
const styles = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
    margin: 0,
    padding: 0,
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    boxShadow: C.shadow,
  },
  logo: {
    fontSize: "22px",
    fontWeight: 700,
    color: C.primary,
    textDecoration: "none",
  },
  navBtns: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "8px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: C.primary,
    color: C.white,
  },
  btnOutline: {
    background: "transparent",
    border: `2px solid ${C.primary}`,
    color: C.primary,
  },
  hero: {
    textAlign: "center",
    padding: "60px 40px 40px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: C.white,
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: 800,
    margin: "0 0 12px",
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: "18px",
    opacity: 0.9,
    margin: "0 0 30px",
  },
  searchBox: {
    display: "flex",
    maxWidth: "600px",
    margin: "0 auto",
    gap: "8px",
  },
  searchInput: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    outline: "none",
    fontFamily: "inherit",
  },
  searchBtn: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#f59e0b",
    color: C.white,
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  resultHeader: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "20px",
    color: C.text,
  },
  doctorCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    background: C.white,
    borderRadius: C.radius,
    border: `1px solid ${C.border}`,
    marginBottom: "10px",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    textDecoration: "none",
    color: "inherit",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  avatar: (bg, color) => ({
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: bg,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
    flexShrink: 0,
  }),
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: "16px", fontWeight: 600, margin: "0 0 4px" },
  docSpec: (bg, color) => ({
    fontSize: "12px",
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: "6px",
    background: bg,
    color: color,
    display: "inline-block",
  }),
  docAddr: { fontSize: "14px", color: C.textMuted, marginTop: "6px" },
  arrow: { color: "#d1d5db", fontSize: "18px" },
  footer: {
    textAlign: "center",
    padding: "30px",
    color: C.textMuted,
    fontSize: "14px",
    borderTop: `1px solid ${C.border}`,
    marginTop: "40px",
  },
  badge: (bg, color) => ({
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "20px",
    background: bg,
    color: color,
  }),
  // Doctor detail
  backBtn: {
    background: "none",
    border: "none",
    color: C.primary,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    padding: "8px 0",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "16px",
  },
  profileCard: {
    display: "flex",
    gap: "24px",
    padding: "24px",
    background: C.white,
    borderRadius: C.radius,
    border: `1px solid ${C.border}`,
    marginBottom: "20px",
  },
  bigAvatar: (bg, color) => ({
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: bg,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "24px",
    flexShrink: 0,
  }),
  profileName: { fontSize: "22px", fontWeight: 700, margin: "0 0 8px" },
  profileDesc: { fontSize: "14px", color: C.textMuted, lineHeight: 1.6, margin: "8px 0 0" },
  slotsSection: {
    background: C.white,
    borderRadius: C.radius,
    border: `1px solid ${C.border}`,
    padding: "24px",
  },
  slotsTitle: { fontSize: "18px", fontWeight: 600, margin: "0 0 16px" },
  dateGroup: { marginBottom: "16px" },
  dateHeader: {
    fontSize: "13px",
    fontWeight: 600,
    color: C.textMuted,
    textTransform: "capitalize",
    paddingBottom: "8px",
    borderBottom: `1px solid #f3f4f6`,
    marginBottom: "10px",
  },
  slotBtn: (sel) => ({
    padding: "10px 18px",
    borderRadius: "10px",
    border: sel ? "2px solid #2563eb" : "2px solid transparent",
    background: sel ? "#eff6ff" : "#f3f4f6",
    color: sel ? "#2563eb" : C.text,
    fontWeight: sel ? 600 : 400,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    margin: "0 8px 8px 0",
    transition: "all 0.15s",
  }),
  authModal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: C.white,
    borderRadius: "16px",
    padding: "40px 36px",
    width: "380px",
    maxWidth: "90vw",
    textAlign: "center",
    zIndex: 1001,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  modalIcon: { fontSize: "48px", marginBottom: "16px" },
  modalTitle: { fontSize: "20px", fontWeight: 700, margin: "0 0 8px" },
  modalText: { fontSize: "14px", color: C.textMuted, margin: "0 0 24px" },
  modalBtns: { display: "flex", flexDirection: "column", gap: "10px" },
  modalBtn: {
    padding: "12px 0",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
    display: "block",
  },
  // TEST BANNER
  testBanner: {
    background: "#ef4444",
    color: "white",
    textAlign: "center",
    padding: "12px",
    fontWeight: 700,
    fontSize: "16px",
    letterSpacing: "1px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: C.textMuted,
  },
  empty: {
    textAlign: "center",
    padding: "50px 20px",
    color: C.textMuted,
  },
};

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

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (query) => {
    try {
      setLoading(true);
      const params = query ? { search: query } : {};
      const res = await api.get("/doctors", { params });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
    setSelectedDoctor(null);
    setBooking(null);
  };

  const openDoctorDetail = async (doctor) => {
    setSelectedDoctor(doctor);
    setBooking(null);
    setMessage(null);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/availabilities/doctor/${doctor.id}`);
      setAvailabilities(res.data);
    } catch (err) {
      setAvailabilities([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBookClick = (slot) => {
    if (!user) {
      setPendingSlot(slot);
      setShowAuthModal(true);
      return;
    }
    setBooking(slot);
    setReason("");
  };

  const confirmBooking = async () => {
    try {
      await api.post("/appointments", {
        doctor_id: selectedDoctor.id,
        availability_id: booking.id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        reason,
      });
      setMessage({ type: "success", text: "✅ Rendez-vous réservé avec succès !" });
      setBooking(null);
      setReason("");
      const res = await api.get(`/availabilities/doctor/${selectedDoctor.id}`);
      setAvailabilities(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "❌ " + (err.response?.data?.message || "Erreur") });
    }
  };

  const getInitials = (first, last) => ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  const getBg = (s) => specialityColors[s] || specialityColors.default;
  const getText = (s) => specialityTextColors[s] || specialityTextColors.default;

  const groupedSlots = availabilities.reduce((acc, slot) => {
    const d = slot.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div style={styles.page}>
      {/* TEST BANNER */}
      <div style={styles.testBanner}>
        🚨 TEST INLINE STYLES — NOUVEAU DESIGN SANS App.css 🚨
      </div>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>🏥 HealthConnect</Link>
        <div style={styles.navBtns}>
          {user ? (
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => navigate("/dashboard")}>
              Tableau de bord
            </button>
          ) : (
            <>
              <Link to="/login" style={{ ...styles.btn, ...styles.btnOutline }}>Connexion</Link>
              <Link to="/register" style={{ ...styles.btn, ...styles.btnPrimary }}>Inscription</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Trouvez votre médecin</h1>
        <p style={styles.heroSub}>Réservez en ligne, 24h/24, 7j/7</p>
        <form onSubmit={handleSearch} style={styles.searchBox}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Nom du médecin, spécialité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>Rechercher</button>
        </form>
      </section>

      {/* Content */}
      <div style={styles.container}>
        {selectedDoctor ? (
          <div>
            <button style={styles.backBtn} onClick={() => { setSelectedDoctor(null); setBooking(null); setMessage(null); }}>
              ← Retour aux résultats
            </button>

            {message && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: 500,
                background: message.type === "success" ? "#d1fae5" : "#fef2f2",
                color: message.type === "success" ? "#065f46" : "#991b1b",
              }}>
                {message.text}
              </div>
            )}

            <div style={styles.profileCard}>
              <div style={styles.bigAvatar(getBg(selectedDoctor.speciality), getText(selectedDoctor.speciality))}>
                {getInitials(selectedDoctor.first_name, selectedDoctor.last_name)}
              </div>
              <div>
                <h2 style={styles.profileName}>Dr {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
                <div style={styles.docSpec(getBg(selectedDoctor.speciality), getText(selectedDoctor.speciality))}>
                  {selectedDoctor.speciality}
                </div>
                {selectedDoctor.address && (
                  <div style={{ ...styles.docAddr, marginTop: "12px" }}>📍 {selectedDoctor.address}</div>
                )}
                {selectedDoctor.description && (
                  <p style={styles.profileDesc}>{selectedDoctor.description}</p>
                )}
                <div style={{ marginTop: "12px" }}>
                  <span style={styles.badge("#dbeafe", "#1d4ed8")}>Validé ✓</span>
                </div>
              </div>
            </div>

            <div style={styles.slotsSection}>
              <h3 style={styles.slotsTitle}>🗓️ Créneaux disponibles</h3>
              {loadingDetail ? (
                <div style={styles.loading}>Chargement des créneaux...</div>
              ) : availabilities.length === 0 ? (
                <div style={styles.empty}>Aucun créneau disponible pour le moment.</div>
              ) : (
                sortedDates.map((dateKey) => (
                  <div key={dateKey} style={styles.dateGroup}>
                    <div style={styles.dateHeader}>
                      {new Date(dateKey).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    <div>
                      {groupedSlots[dateKey].map((slot) => (
                        <button
                          key={slot.id}
                          style={styles.slotBtn(booking?.id === slot.id)}
                          onClick={() => handleBookClick(slot)}
                          onMouseEnter={(e) => { if (booking?.id !== slot.id) e.target.style.background = "#e5e7eb"; }}
                          onMouseLeave={(e) => { if (booking?.id !== slot.id) e.target.style.background = "#f3f4f6"; }}
                        >
                          {slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Auth modal */}
            {showAuthModal && (
              <>
                <div style={styles.overlay} onClick={() => { setShowAuthModal(false); setPendingSlot(null); }} />
                <div style={styles.authModal}>
                  <div style={styles.modalIcon}>🔒</div>
                  <h3 style={styles.modalTitle}>Connectez-vous</h3>
                  <p style={styles.modalText}>Vous devez avoir un compte pour réserver un rendez-vous.</p>
                  <div style={styles.modalBtns}>
                    <Link to="/login" style={{ ...styles.modalBtn, background: C.primary, color: C.white }}>
                      Se connecter
                    </Link>
                    <Link to="/register" style={{ ...styles.modalBtn, background: "#f3f4f6", color: C.text }}>
                      Créer un compte
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Booking modal */}
            {booking && !showAuthModal && (
              <>
                <div style={styles.overlay} onClick={() => setBooking(null)} />
                <div style={styles.authModal}>
                  <h3 style={styles.modalTitle}>Confirmer la réservation</h3>
                  <p style={styles.modalText}>
                    {new Date(booking.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    <br />
                    {booking.start_time?.slice(0, 5)} — {booking.end_time?.slice(0, 5)}
                  </p>
                  <div className="form-group" style={{ textAlign: "left", marginBottom: "20px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Motif</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Motif de la consultation..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <div style={styles.modalBtns}>
                    <button onClick={confirmBooking} style={{ ...styles.modalBtn, background: C.primary, color: C.white }}>
                      Confirmer
                    </button>
                    <button onClick={() => setBooking(null)} style={{ ...styles.modalBtn, background: "#f3f4f6", color: C.text }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h2 style={styles.resultHeader}>
              {doctors.length} médecin{doctors.length > 1 ? "s" : ""} disponible{doctors.length > 1 ? "s" : ""}
            </h2>

            {loading ? (
              <div style={styles.loading}>Recherche en cours...</div>
            ) : doctors.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <p>Aucun médecin trouvé</p>
              </div>
            ) : (
              doctors.map((doc) => {
                const bg = getBg(doc.speciality);
                const text = getText(doc.speciality);
                return (
                  <button
                    key={doc.id}
                    style={styles.doctorCard}
                    onClick={() => openDoctorDetail(doc)}
                  >
                    <div style={styles.avatar(bg, text)}>
                      {getInitials(doc.first_name, doc.last_name)}
                    </div>
                    <div style={styles.docInfo}>
                      <div style={styles.docName}>Dr {doc.first_name} {doc.last_name}</div>
                      <div style={styles.docSpec(bg, text)}>{doc.speciality}</div>
                      {doc.address && <div style={styles.docAddr}>📍 {doc.address}</div>}
                    </div>
                    <div style={styles.arrow}>→</div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Features */}
      {!selectedDoctor && (
        <div style={{ ...styles.container, paddingTop: 0 }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", marginBottom: "30px" }}>
            Pourquoi HealthConnect ?
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            {[
              { icon: "📅", title: "Réservation 24/7", desc: "Prenez rendez-vous sans téléphone" },
              { icon: "👨‍⚕️", title: "Médecins vérifiés", desc: "Tous nos professionnels sont certifiés" },
              { icon: "💬", title: "Messagerie", desc: "Échangez avec votre médecin" },
              { icon: "🔒", title: "Sécurisé", desc: "Vos données sont protégées" },
            ].map((f, i) => (
              <div key={i} style={{
                background: C.white,
                borderRadius: C.radius,
                border: `1px solid ${C.border}`,
                padding: "24px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: C.textMuted, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        © 2026 HealthConnect. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Home;