import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const sidebarLinks = {
  PATIENT: [
    { path: "/dashboard", label: "📊 Vue d'ensemble" },
    { path: "/patient/doctors", label: "👨‍⚕️ Médecins" },
    { path: "/patient/appointments", label: "📅 Mes rendez-vous" },
    { path: "/patient/medical-record", label: "📋 Dossier médical" },
    { path: "/patient/ai-assistant", label: "🤖 Assistant IA" },
    { path: "/patient/ai-history", label: "📋 Historique IA" },
    { path: "/patient/messages", label: "💬 Messagerie" },
  ],
  DOCTOR: [
    { path: "/dashboard", label: "📊 Vue d'ensemble" },
    { path: "/doctor/profile", label: "👤 Mon profil" },
    { path: "/doctor/availability", label: "🗓️ Disponibilités" },
    { path: "/doctor/appointments", label: "📅 Rendez-vous reçus" },
    { path: "/doctor/patients", label: "👥 Mes patients" },
    { path: "/doctor/messages", label: "💬 Messages" },
  ],
  ADMIN: [
    { path: "/dashboard", label: "📊 Vue d'ensemble" },
    { path: "/admin/doctors", label: "👨‍⚕️ Médecins" },
    { path: "#disabled", label: "👤 Utilisateurs", disabled: true },
    { path: "#disabled", label: "📈 Statistiques", disabled: true },
  ],
};

const ProtectedLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "PATIENT": return "Patient";
      case "DOCTOR": return "Médecin";
      case "ADMIN": return "Administrateur";
      default: return role;
    }
  };

  const links = sidebarLinks[user?.role] || [];

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">🏥 HealthConnect</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link, i) =>
            link.disabled ? (
              <span key={i} className="nav-item nav-item-disabled">
                {link.label}
              </span>
            ) : (
              <a
                key={i}
                href={link.path}
                className={`nav-item ${location.pathname === link.path ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                }}
              >
                {link.label}
              </a>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.first_name} {user?.last_name}</span>
            <span className="sidebar-user-role">{getRoleLabel(user?.role)}</span>
          </div>
          <button className="btn btn-outline btn-full" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">{getPageTitle(location.pathname, user?.role)}</h1>
          </div>
          <div className="user-badge">
            <span className="role-badge">{getRoleLabel(user?.role)}</span>
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
};

function getPageTitle(path, role) {
  const titles = {
    "/dashboard": role === "PATIENT" ? "Tableau de bord patient" : role === "DOCTOR" ? "Tableau de bord médecin" : "Administration",
    "/patient/doctors": "Rechercher un médecin",
    "/patient/appointments": "Mes rendez-vous",
    "/patient/medical-record": "Mon dossier médical",
    "/patient/messages": "Messagerie",
    "/patient/ai-assistant": "Assistant IA",
    "/patient/ai-history": "Historique IA",
    "/doctor/messages": "Messagerie",
    "/doctor/profile": "Mon profil médecin",
    "/doctor/availability": "Gestion des disponibilités",
    "/doctor/appointments": "Rendez-vous reçus",
    "/doctor/patients": "Mes patients",
    "/admin/doctors": "Gestion des médecins",
  };
  // Dynamic routes
  if (path.startsWith("/patient/doctors/")) return "Détail du médecin";
  if (path.startsWith("/doctor/patients/")) return "Dossier patient";
  return titles[path] || "HealthConnect";
}

export default ProtectedLayout;