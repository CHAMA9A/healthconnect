import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-mini">Chargement...</div>;
  }

  return (
    <>
      <div className="welcome-card">
        <h2>Bienvenue, {user?.first_name} {user?.last_name}</h2>
        <p>{data?.message}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <h3>{data?.stats?.title}</h3>
            <p className="stat-count">{data?.stats?.count}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👤</span>
          <div>
            <h3>Email</h3>
            <p className="stat-count">{user?.email}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div>
            <h3>Membre depuis</h3>
            <p className="stat-count">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("fr-FR")
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;