-- ============================================================
-- HealthConnect - Initialisation PostgreSQL pour Docker
-- Ce script est exécuté automatiquement par le conteneur
-- PostgreSQL au premier démarrage.
-- La base "healthconnect" est déjà créée via POSTGRES_DB.
-- ============================================================

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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- Table doctors
-- ============================================================
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    speciality VARCHAR(150) NOT NULL DEFAULT 'Généraliste',
    description TEXT,
    address VARCHAR(255),
    phone VARCHAR(20),
    is_validated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_speciality ON doctors(speciality);
CREATE INDEX idx_doctors_validated ON doctors(is_validated);

-- ============================================================
-- Table availabilities
-- ============================================================
CREATE TABLE availabilities (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_availabilities_doctor ON availabilities(doctor_id);
CREATE INDEX idx_availabilities_date ON availabilities(date);

-- ============================================================
-- Table appointments
-- ============================================================
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    availability_id INTEGER REFERENCES availabilities(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(500),
    cancellation_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(date);

-- ============================================================
-- Table medical_records (un dossier par patient)
-- ============================================================
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    history TEXT DEFAULT '',
    allergies TEXT DEFAULT '',
    treatments TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

-- ============================================================
-- Table medical_reports (comptes rendus par médecin)
-- ============================================================
CREATE TABLE medical_reports (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_reports_patient ON medical_reports(patient_id);
CREATE INDEX idx_medical_reports_doctor ON medical_reports(doctor_id);

-- ============================================================
-- Table medical_documents
-- ============================================================
CREATE TABLE medical_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) DEFAULT 'other',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_documents_patient ON medical_documents(patient_id);

-- ============================================================
-- Table medical_results
-- ============================================================
CREATE TABLE medical_results (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    result_value VARCHAR(500) NOT NULL,
    comment TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_results_patient ON medical_results(patient_id);
CREATE INDEX idx_medical_results_doctor ON medical_results(doctor_id);

-- ============================================================
-- Table messages (messagerie entre patient et médecin)
-- ============================================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_appointment ON messages(appointment_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================
-- Table ai_diagnoses (pré-diagnostics IA)
-- ============================================================
CREATE TABLE ai_diagnoses (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symptoms JSONB NOT NULL,
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    suggestion TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    disclaimer TEXT NOT NULL DEFAULT 'Ce résultat est indicatif et ne remplace pas un avis médical professionnel. En cas de doute ou de symptômes graves, consultez un médecin.',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_diagnoses_patient ON ai_diagnoses(patient_id);
CREATE INDEX idx_ai_diagnoses_risk ON ai_diagnoses(risk_level);