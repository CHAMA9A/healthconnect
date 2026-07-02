-- ============================================================
-- HealthConnect - Données de test (seed)
-- Usage :
--   docker exec -i healthconnect-db psql -U postgres -d healthconnect < database/seed-test-data.sql
--
-- Ou via Node.js (recommandé pour la gestion des hash bcrypt) :
--   docker exec -it healthconnect-backend node scripts/seed.js
-- ============================================================
-- Ce script est idempotent : il peut être exécuté plusieurs fois
-- sans créer de doublons (utilisation de WHERE NOT EXISTS).
-- ============================================================

-- ============================================================
-- 1. ADMIN
-- ============================================================
-- Mot de passe : test123 (hash bcrypt généré avec bcryptjs, salt rounds = 10)
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Admin', 'HealthConnect', 'admin@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com');

-- ============================================================
-- 2. PATIENTS
-- ============================================================
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Amine', 'El Mansouri', 'patient1@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'PATIENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patient1@test.com');

INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Sara', 'Benali', 'patient2@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'PATIENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patient2@test.com');

INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Youssef', 'Haddad', 'patient3@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'PATIENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patient3@test.com');

-- ============================================================
-- 3. MÉDECINS (utilisateurs + profils)
-- ============================================================
-- 3a. Médecins validés

-- Docteur 1 : Nadia Karim - Médecin généraliste - Paris
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Nadia', 'Karim', 'doctor1@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'DOCTOR'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor1@test.com');

INSERT INTO doctors (user_id, speciality, description, address, phone, is_validated)
SELECT u.id, 'Médecin généraliste', 'Consultation de médecine générale', 'Paris', '0600000001', TRUE
FROM users u WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id);

-- Docteur 2 : Samir Alaoui - Pédiatre - Lyon
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Samir', 'Alaoui', 'doctor2@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'DOCTOR'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor2@test.com');

INSERT INTO doctors (user_id, speciality, description, address, phone, is_validated)
SELECT u.id, 'Pédiatre', 'Consultation de pédiatrie', 'Lyon', '0600000002', TRUE
FROM users u WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id);

-- Docteur 3 : Leila Berrada - Cardiologue - Marseille
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Leila', 'Berrada', 'doctor3@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'DOCTOR'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor3@test.com');

INSERT INTO doctors (user_id, speciality, description, address, phone, is_validated)
SELECT u.id, 'Cardiologue', 'Consultation de cardiologie', 'Marseille', '0600000003', TRUE
FROM users u WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id);

-- 3b. Médecin NON validé (pour tester la validation admin)

-- Docteur 4 : Mehdi Tazi - Dermatologue - Toulouse (en attente)
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Mehdi', 'Tazi', 'doctor.pending@test.com', '$2a$10$/IS3AW7pj0yBzRWn5oQ3Uu63WUO2IjOE1a7UL6XJ3Cbh/qlvpiyu6', 'DOCTOR'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor.pending@test.com');

INSERT INTO doctors (user_id, speciality, description, address, phone, is_validated)
SELECT u.id, 'Dermatologue', 'Consultation de dermatologie', 'Toulouse', '0600000004', FALSE
FROM users u WHERE u.email = 'doctor.pending@test.com'
AND NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id);

-- ============================================================
-- 4. DISPONIBILITÉS
-- ============================================================
-- Chaque médecin validé a 5 créneaux :
--   - demain (CURRENT_DATE + 1) : 09:00, 10:00, 11:00
--   - après-demain (CURRENT_DATE + 2) : 14:00, 15:00

-- Docteur 1 - Disponibilités
INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '09:00', '09:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '10:00', '10:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '10:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '11:00', '11:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '11:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '14:00', '14:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '14:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '15:00', '15:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '15:00');

-- Docteur 2 - Disponibilités
INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '09:00', '09:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '10:00', '10:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '10:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '11:00', '11:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '11:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '14:00', '14:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '14:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '15:00', '15:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '15:00');

-- Docteur 3 - Disponibilités
INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '09:00', '09:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '10:00', '10:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '10:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 1, '11:00', '11:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 1 AND a.start_time = '11:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '14:00', '14:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '14:00');

INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
SELECT d.id, CURRENT_DATE + 2, '15:00', '15:30', TRUE
FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'
AND NOT EXISTS (SELECT 1 FROM availabilities a WHERE a.doctor_id = d.id AND a.date = CURRENT_DATE + 2 AND a.start_time = '15:00');

-- ============================================================
-- 5. RENDEZ-VOUS
-- ============================================================
-- Note : Les créneaux réservés ci-dessous sont marqués is_available = FALSE

-- Rendez-vous 1 : patient1 x doctor1, PENDING (créneau demain 09:00)
INSERT INTO appointments (patient_id, doctor_id, availability_id, date, start_time, end_time, status, reason)
SELECT
  (SELECT id FROM users WHERE email = 'patient1@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'),
  (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00'),
  CURRENT_DATE + 1, '09:00', '09:30', 'PENDING', 'Consultation générale'
WHERE NOT EXISTS (
  SELECT 1 FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'patient1@test.com')
  AND doctor_id = (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com')
  AND date = CURRENT_DATE + 1 AND start_time = '09:00'
);

UPDATE availabilities SET is_available = FALSE
WHERE id = (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00')
AND is_available = TRUE;

-- Rendez-vous 2 : patient2 x doctor2, CONFIRMED (créneau demain 09:00)
INSERT INTO appointments (patient_id, doctor_id, availability_id, date, start_time, end_time, status, reason)
SELECT
  (SELECT id FROM users WHERE email = 'patient2@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'),
  (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00'),
  CURRENT_DATE + 1, '09:00', '09:30', 'CONFIRMED', 'Consultation pédiatrique'
WHERE NOT EXISTS (
  SELECT 1 FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'patient2@test.com')
  AND doctor_id = (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com')
  AND date = CURRENT_DATE + 1 AND start_time = '09:00'
);

UPDATE availabilities SET is_available = FALSE
WHERE id = (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00')
AND is_available = TRUE;

-- Rendez-vous 3 : patient3 x doctor3, COMPLETED (créneau demain 09:00)
INSERT INTO appointments (patient_id, doctor_id, availability_id, date, start_time, end_time, status, reason)
SELECT
  (SELECT id FROM users WHERE email = 'patient3@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'),
  (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00'),
  CURRENT_DATE + 1, '09:00', '09:30', 'COMPLETED', 'Consultation cardiologique'
WHERE NOT EXISTS (
  SELECT 1 FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'patient3@test.com')
  AND doctor_id = (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com')
  AND date = CURRENT_DATE + 1 AND start_time = '09:00'
);

UPDATE availabilities SET is_available = FALSE
WHERE id = (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '09:00')
AND is_available = TRUE;

-- Rendez-vous 4 : patient1 x doctor2, CANCELLED (créneau demain 10:00)
INSERT INTO appointments (patient_id, doctor_id, availability_id, date, start_time, end_time, status, reason, cancellation_reason, cancelled_at)
SELECT
  (SELECT id FROM users WHERE email = 'patient1@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'),
  (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '10:00'),
  CURRENT_DATE + 1, '10:00', '10:30', 'CANCELLED', 'Suivi pédiatrique', 'Impossible de se déplacer', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM appointments WHERE patient_id = (SELECT id FROM users WHERE email = 'patient1@test.com')
  AND doctor_id = (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com')
  AND date = CURRENT_DATE + 1 AND start_time = '10:00'
);

UPDATE availabilities SET is_available = FALSE
WHERE id = (SELECT a.id FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com' AND a.date = CURRENT_DATE + 1 AND a.start_time = '10:00')
AND is_available = TRUE;

-- ============================================================
-- 6. DOSSIERS MÉDICAUX
-- ============================================================

-- Patient 1 : Amine El Mansouri
INSERT INTO medical_records (patient_id, history, allergies, treatments)
SELECT id, 'Consultation régulière, fatigue occasionnelle.', 'Aucune allergie connue.', 'Aucun traitement en cours.'
FROM users WHERE email = 'patient1@test.com'
AND NOT EXISTS (SELECT 1 FROM medical_records WHERE patient_id = (SELECT id FROM users WHERE email = 'patient1@test.com'));

-- Patient 2 : Sara Benali
INSERT INTO medical_records (patient_id, history, allergies, treatments)
SELECT id, 'Antécédents d''asthme léger.', 'Pollen.', 'Ventoline si besoin.'
FROM users WHERE email = 'patient2@test.com'
AND NOT EXISTS (SELECT 1 FROM medical_records WHERE patient_id = (SELECT id FROM users WHERE email = 'patient2@test.com'));

-- Patient 3 : Youssef Haddad
INSERT INTO medical_records (patient_id, history, allergies, treatments)
SELECT id, 'Suivi cardiologique préventif.', 'Pénicilline.', 'Aucun traitement quotidien.'
FROM users WHERE email = 'patient3@test.com'
AND NOT EXISTS (SELECT 1 FROM medical_records WHERE patient_id = (SELECT id FROM users WHERE email = 'patient3@test.com'));

-- ============================================================
-- 7. COMPTES RENDUS MÉDICAUX
-- ============================================================

-- Compte rendu consultation générale (patient1 x doctor1)
INSERT INTO medical_reports (patient_id, doctor_id, title, content)
SELECT
  (SELECT id FROM users WHERE email = 'patient1@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'),
  'Compte rendu consultation générale',
  'Patient vu en consultation pour fatigue occasionnelle. Examen clinique normal. Pression artérielle : 12/8. Aucune anomalie détectée. Recommandation : repos et alimentation équilibrée. Aucun traitement médicamenteux prescrit.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_reports WHERE patient_id = (SELECT id FROM users WHERE email = 'patient1@test.com')
  AND title = 'Compte rendu consultation générale'
);

-- Compte rendu consultation pédiatrique (patient2 x doctor2)
INSERT INTO medical_reports (patient_id, doctor_id, title, content)
SELECT
  (SELECT id FROM users WHERE email = 'patient2@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'),
  'Compte rendu consultation pédiatrique',
  'Suivi de l''asthme léger chez l''enfant. Examen pulmonaire : sifflements légers. Fonction respiratoire stable. Poursuite du traitement par Ventoline à la demande. Rappel des mesures d''éviction des allergènes (pollen). Prochain contrôle dans 3 mois.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_reports WHERE patient_id = (SELECT id FROM users WHERE email = 'patient2@test.com')
  AND title = 'Compte rendu consultation pédiatrique'
);

-- Compte rendu consultation cardiologique (patient3 x doctor3)
INSERT INTO medical_reports (patient_id, doctor_id, title, content)
SELECT
  (SELECT id FROM users WHERE email = 'patient3@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'),
  'Compte rendu consultation cardiologique',
  'Consultation de suivi cardiologique préventif. ECG : rythme sinusal normal, pas de trouble de conduction. Échocardiographie : fraction d''éjection ventriculaire gauche normale (60 %). Pas de signe d''hypertrophie. Poursuite de la prévention primaire. Rendez-vous de contrôle dans 6 mois.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_reports WHERE patient_id = (SELECT id FROM users WHERE email = 'patient3@test.com')
  AND title = 'Compte rendu consultation cardiologique'
);

-- ============================================================
-- 8. RÉSULTATS MÉDICAUX
-- ============================================================

-- Résultat : Tension artérielle (patient3 x doctor3)
INSERT INTO medical_results (patient_id, doctor_id, title, result_value, comment)
SELECT
  (SELECT id FROM users WHERE email = 'patient3@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor3@test.com'),
  'Tension artérielle', '12/8 mmHg', 'Tension normale, bonne santé cardiovasculaire.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_results WHERE patient_id = (SELECT id FROM users WHERE email = 'patient3@test.com')
  AND title = 'Tension artérielle'
);

-- Résultat : Température (patient1 x doctor1)
INSERT INTO medical_results (patient_id, doctor_id, title, result_value, comment)
SELECT
  (SELECT id FROM users WHERE email = 'patient1@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor1@test.com'),
  'Température', '37.2 °C', 'Température normale, pas de fièvre.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_results WHERE patient_id = (SELECT id FROM users WHERE email = 'patient1@test.com')
  AND title = 'Température'
);

-- Résultat : Fréquence cardiaque (patient2 x doctor2)
INSERT INTO medical_results (patient_id, doctor_id, title, result_value, comment)
SELECT
  (SELECT id FROM users WHERE email = 'patient2@test.com'),
  (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'doctor2@test.com'),
  'Fréquence cardiaque', '85 bpm', 'Fréquence cardiaque normale pour l''âge de l''enfant.'
WHERE NOT EXISTS (
  SELECT 1 FROM medical_results WHERE patient_id = (SELECT id FROM users WHERE email = 'patient2@test.com')
  AND title = 'Fréquence cardiaque'
);

-- ============================================================
-- Récapitulatif des comptes créés
-- ============================================================
-- Pour afficher le récap, exécuter :
--
--   docker exec -it healthconnect-db psql -U postgres -d healthconnect -c "
--   SELECT role, email, first_name || ' ' || last_name AS name FROM users ORDER BY role, last_name;
--   "
--
--   docker exec -it healthconnect-db psql -U postgres -d healthconnect -c "
--   SELECT u.email, d.speciality, d.address, d.is_validated FROM doctors d JOIN users u ON u.id = d.user_id;
--   "
--
--   docker exec -it healthconnect-db psql -U postgres -d healthconnect -c "
--   SELECT a.id, u.email AS doctor, a.date, a.start_time, a.end_time, a.is_available FROM availabilities a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id ORDER BY a.date, a.start_time;
--   "
--
--   docker exec -it healthconnect-db psql -U postgres -d healthconnect -c "
--   SELECT a.id, u_pat.email AS patient, u_doc.email AS doctor, a.date, a.start_time, a.status FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN users u_doc ON u_doc.id = d.user_id JOIN users u_pat ON u_pat.id = a.patient_id ORDER BY a.id;
--   "
-- ============================================================
