-- ============================================================
-- HealthConnect - Script d'initialisation de la base de données
-- ============================================================

-- Création de la base de données
CREATE DATABASE healthconnect;

-- Connexion à la base
\c healthconnect;

-- Création du type enum pour les rôles
CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Index pour accélérer la recherche par email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);