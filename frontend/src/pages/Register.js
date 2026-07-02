import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur d'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          🏥 HealthConnect
        </Link>
        <h2>Inscription</h2>
        <p className="auth-subtitle">
          Créez votre compte pour accéder à nos services
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Prénom</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Jean"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Nom</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Dupont"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Vous êtes</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Médecin</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 caractères"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Inscription..." : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;