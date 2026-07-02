import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const PatientDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, availRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/availabilities/doctor/${id}`),
        ]);
        setDoctor(docRes.data);
        setAvailabilities(availRes.data);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Médecin introuvable" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = (slot) => {
    setBooking(slot);
  };

  const confirmBooking = async () => {
    try {
      await api.post("/appointments", {
        doctor_id: parseInt(id),
        availability_id: booking.id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        reason,
      });
      setMessage({ type: "success", text: "Rendez-vous réservé avec succès !" });
      setBooking(null);
      setReason("");
      const availRes = await api.get(`/availabilities/doctor/${id}`);
      setAvailabilities(availRes.data);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Erreur lors de la réservation" });
    }
  };

  const getInitials = (first, last) => {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  };

  const getBgColor = (speciality) => specialityColors[speciality] || specialityColors.default;
  const getTextColor = (speciality) => specialityTextColors[speciality] || specialityTextColors.default;

  // Grouper les créneaux par date
  const groupedSlots = availabilities.reduce((acc, slot) => {
    const dateKey = slot.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();

  if (loading) return <div className="loading-screen">Chargement…</div>;
  if (!doctor)
    return (
      <div className="doctor-detail-page">
        <div className="doctor-detail-empty">
          <p>Médecin introuvable.</p>
          <button className="btn btn-outline" onClick={() => navigate("/patient/doctors")}>← Retour</button>
        </div>
      </div>
    );

  const initials = getInitials(doctor.first_name, doctor.last_name);
  const bgColor = getBgColor(doctor.speciality);
  const textColor = getTextColor(doctor.speciality);

  return (
    <div className="doctor-detail-page">
      {/* Header */}
      <button className="doctor-detail-back" onClick={() => navigate("/patient/doctors")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Retour aux résultats
      </button>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Doctor profile hero */}
      <div className="doctor-profile-hero">
        <div className="doctor-profile-avatar" style={{ backgroundColor: bgColor, color: textColor }}>
          {initials}
        </div>
        <div className="doctor-profile-info">
          <h1>Dr {doctor.first_name} {doctor.last_name}</h1>
          <span className="doctor-profile-speciality" style={{ backgroundColor: bgColor, color: textColor }}>
            {doctor.speciality}
          </span>
          {doctor.address && (
            <div className="doctor-profile-address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{doctor.address}</span>
            </div>
          )}
          {doctor.description && (
            <p className="doctor-profile-desc">{doctor.description}</p>
          )}
        </div>
      </div>

      {/* Booking section */}
      <div className="doctor-booking-section">
        <h2>Créneaux disponibles</h2>
        {availabilities.length === 0 ? (
          <div className="doctor-slots-empty">
            <div className="slots-empty-icon">📅</div>
            <p>Aucun créneau disponible pour le moment</p>
          </div>
        ) : (
          <div className="doctor-slots-by-date">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="slot-date-group">
                <div className="slot-date-header">
                  {new Date(dateKey).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <div className="slot-time-grid">
                  {groupedSlots[dateKey].map((slot) => (
                    <button
                      key={slot.id}
                      className={`slot-time-card ${booking?.id === slot.id ? "selected" : ""}`}
                      onClick={() => handleBook(slot)}
                    >
                      <span className="slot-time-label">
                        {slot.start_time?.slice(0, 5)}
                      </span>
                      <span className="slot-time-sep">—</span>
                      <span className="slot-time-label">
                        {slot.end_time?.slice(0, 5)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {booking && (
        <>
          <div className="booking-overlay" onClick={() => setBooking(null)} />
          <div className="booking-modal">
            <button className="booking-modal-close" onClick={() => setBooking(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
            <div className="booking-modal-header">
              <div className="booking-modal-avatar" style={{ backgroundColor: bgColor, color: textColor }}>
                {initials}
              </div>
              <div>
                <h3>Dr {doctor.first_name} {doctor.last_name}</h3>
                <p className="booking-modal-slot">
                  {new Date(booking.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  {" — "}
                  {booking.start_time?.slice(0, 5)} à {booking.end_time?.slice(0, 5)}
                </p>
              </div>
            </div>
            <div className="booking-modal-body">
              <div className="form-group">
                <label>Motif de la consultation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez brièvement le motif de votre visite…"
                  rows={3}
                />
              </div>
            </div>
            <div className="booking-modal-actions">
              <button className="btn btn-primary btn-lg" onClick={confirmBooking}>
                Confirmer la réservation
              </button>
              <button className="btn btn-outline" onClick={() => setBooking(null)}>
                Annuler
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDoctorDetail;