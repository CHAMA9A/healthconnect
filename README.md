<p align="center">
  <img src="frontend/public/logo.png" alt="HealthConnect" width="320" />
</p>

<p align="center">
  <strong>Plateforme de santé connectée</strong> — Prenez soin de vous, connectément.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Backend-Express-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens" alt="JWT" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker Compose" />
</p>

---

## ✨ Fonctionnalités

### 👤 Authentification & Rôles

- Inscription et connexion sécurisées (JWT, mots de passe hashés)
- **3 rôles** : PATIENT, DOCTOR, ADMIN
- Routes protégées par rôle et middleware d'authentification
- Interface adaptée à chaque rôle (sidebar, navigation)

### 🔍 Recherche de médecins

- Navigation publique — consultation sans connexion
- Recherche avec filtres par spécialité
- Profil détaillé du médecin (spécialité, adresse, description)
- Affichage des disponibilités en temps réel

### 📅 Rendez-vous

- **Patient** : prise de rendez-vous, modification, annulation avec motif
- **Médecin** : confirmation, complétion des rendez-vous reçus
- Statuts : PENDING → CONFIRMED → COMPLETED / CANCELLED
- Créneaux automatiquement libérés en cas d'annulation
- Filtres : Tous, À venir, Passés, Annulés

### 🗓️ Disponibilités (médecin)

- Gestion complète des créneaux (ajout, modification, suppression)
- Créneaux sur plusieurs jours avec horaires personnalisés
- Vue calendrier des disponibilités
- **Profil créé automatiquement** si inexistant

### 📋 Dossier médical

- **Patient** : consultation de son dossier (historique, allergies, traitements)
- **Médecin** : accès aux dossiers de ses patients
- Rapports médicaux (comptes rendus de consultation)
- Résultats d'analyses
- Documents (ordonnances, imagerie, etc.)
- Design 2 colonnes pour une lecture optimale

### 💬 Messagerie patient-médecin

- Messagerie privée par rendez-vous
- Interface type Messenger / Instagram Desktop
- Panneau latéral : liste des conversations avec dernier message
- Zone de chat : bulles bleues (envoyé) / grises (reçu)
- Envoi par touche Entrée, auto-scroll, auto-focus

### 🤖 Assistant IA de pré-diagnostic

- Questionnaire complet des symptômes :
  - Fièvre, toux, fatigue, douleur (oui/non)
  - Intensité de la douleur (1-10)
  - Difficulté respiratoire, maladie chronique
  - Durée des symptômes, âge
  - Description libre
- **Moteur de règles** (pas de ML, 100% transparent) :
  - Difficulté respiratoire → **HIGH**
  - Douleur ≥ 8 → **HIGH**
  - Âge > 65 + symptômes importants → **HIGH**
  - Fièvre + toux + fatigue → **MEDIUM**
  - Maladie chronique + fièvre → **MEDIUM** ou **HIGH**
  - Score pondéré pour les cas légers
- Résultat avec code couleur :
  - 🟢 **Faible** (vert)
  - 🟠 **Modéré** (orange)
  - 🔴 **Élevé** (rouge)
- **Disclaimer obligatoire** : "Ce résultat est indicatif et ne remplace pas un avis médical professionnel."
- Historique complet des diagnostics
- Nouvelle analyse à tout moment

### 🎥 Téléconsultation (Jitsi Meet)

- Intégration Jitsi Meet dans une iframe sécurisée
- **Génération automatique** d'une salle vidéo à la confirmation du rendez-vous
- Nom de salle unique : `healthconnect-appointment-{id}`
- Bouton **"Rejoindre la téléconsultation"** côté patient
- Bouton **"Démarrer la téléconsultation"** côté médecin
- **Sécurité stricte** :
  - Seul le patient et le médecin concernés peuvent accéder
  - Rendez-vous PENDING → pas d'accès
  - Rendez-vous CANCELLED → pas d'accès
  - ADMIN → pas d'accès

### 🛡️ Administration

- Validation des comptes médecins
- Activation / désactivation des médecins
- Vue d'ensemble de tous les médecins inscrits

---

## 🏗️ Architecture du projet

```
healthconnect/
├── backend/                          # API Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Connexion PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── doctorController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── adminController.js
│   │   │   ├── medicalRecordController.js
│   │   │   ├── medicalReportController.js
│   │   │   ├── medicalDocumentController.js
│   │   │   ├── medicalResultController.js
│   │   │   ├── messageController.js
│   │   │   ├── aiController.js
│   │   │   └── teleconsultationController.js
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT + vérification des rôles
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   ├── Availability.js
│   │   │   ├── Appointment.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── MedicalReport.js
│   │   │   ├── MedicalDocument.js
│   │   │   ├── MedicalResult.js
│   │   │   ├── Message.js
│   │   │   ├── AIDiagnosis.js
│   │   │   └── Teleconsultation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── doctors.js
│   │   │   ├── availabilities.js
│   │   │   ├── appointments.js
│   │   │   ├── admin.js
│   │   │   ├── medicalRecords.js
│   │   │   ├── medicalReports.js
│   │   │   ├── medicalDocuments.js
│   │   │   ├── medicalResults.js
│   │   │   ├── messages.js
│   │   │   ├── ai.js
│   │   │   └── teleconsultation.js
│   │   ├── services/
│   │   │   └── diagnosisEngine.js    # Moteur de règles IA
│   │   └── server.js                 # Point d'entrée
│   ├── scripts/
│   │   └── seed.js                   # Données de test
│   ├── Dockerfile
│   └── package.json
├── frontend/                         # Application React
│   ├── public/
│   │   ├── logo.svg                  # Logo officiel
│   │   ├── favicon.svg               # Favicon
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Configuration Axios
│   │   ├── context/
│   │   │   └── AuthContext.js        # Contexte d'authentification
│   │   ├── components/
│   │   │   └── ProtectedLayout.js    # Layout sidebar + navigation
│   │   ├── pages/
│   │   │   ├── Home.js               # Page d'accueil (type Doctolib)
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── PatientDoctors.js     # Recherche de médecins
│   │   │   ├── PatientDoctorDetail.js
│   │   │   ├── PatientAppointments.js
│   │   │   ├── PatientMedicalRecord.js
│   │   │   ├── PatientMessages.js    # Messagerie (style Messenger)
│   │   │   ├── PatientAIAssistant.js # Questionnaire IA
│   │   │   ├── PatientAIHistory.js
│   │   │   ├── DoctorProfile.js
│   │   │   ├── DoctorAvailability.js
│   │   │   ├── DoctorAppointments.js
│   │   │   ├── DoctorPatients.js
│   │   │   ├── DoctorPatientRecord.js
│   │   │   ├── DoctorMessages.js     # Messagerie (style Messenger)
│   │   │   ├── Teleconsultation.js   # Salon vidéo Jitsi
│   │   │   └── AdminDoctors.js
│   │   └── styles/
│   │       └── App.css
│   ├── Dockerfile
│   └── package.json
├── database/
│   ├── init.sql
│   └── docker-init.sql               # Schéma complet (tables + index)
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

## 🚀 Installation

### Option 1 — Avec Docker (recommandé)

**Prérequis :** [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/)

```bash
# Lancer tout le projet (PostgreSQL + Backend + Frontend)
docker compose up --build

# → Backend : http://localhost:5000
# → Frontend : http://localhost:3000
```

**Autres commandes utiles :**

```bash
# Arrêter les conteneurs
docker compose down

# Réinitialiser complètement (base de données incluse)
docker compose down -v && docker compose up --build

# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Données de test (seed)

```bash
# Exécuter le script de seed dans le conteneur backend
docker exec -it healthconnect-backend node scripts/seed.js
```

La base de données et les tables sont créées automatiquement au premier lancement Docker.

---

### Option 2 — Manuellement (sans Docker)

**Prérequis :**

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou supérieur)

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd healthconnect

# 2. Créer la base de données et les tables
psql -U postgres -f database/init.sql

# 3. Configurer le backend
cd backend
cp .env.example .env
# Modifier .env avec vos informations PostgreSQL
npm install
npm run dev
# → Backend : http://localhost:5000

# 4. Configurer le frontend (nouveau terminal)
cd frontend
npm install
npm start
# → Frontend : http://localhost:3000
```

---

## 👥 Comptes de test

| Rôle   | Email                       | Mot de passe |
| ------- | --------------------------- | ------------ |
| ADMIN   | admin@healthconnect.fr      | admin123     |
| PATIENT | alice@test.fr               | test123      |
| PATIENT | bob@test.fr                 | test123      |
| PATIENT | claire@test.fr              | test123      |
| DOCTOR  | dr.leroy@healthconnect.fr   | doc123       |
| DOCTOR  | dr.moreau@healthconnect.fr  | doc123       |
| DOCTOR  | dr.bernard@healthconnect.fr | doc123       |

---

## 🧪 API Endpoints

### Authentification

| Méthode | Endpoint               | Auth | Rôle | Description                  |
| -------- | ---------------------- | ---- | ----- | ---------------------------- |
| POST     | `/api/auth/register` | Non  | —    | Inscription                  |
| POST     | `/api/auth/login`    | Non  | —    | Connexion                    |
| GET      | `/api/auth/me`       | Oui  | —    | Profil utilisateur connecté |

### Dashboard

| Méthode | Endpoint           | Auth | Rôle | Description     |
| -------- | ------------------ | ---- | ----- | --------------- |
| GET      | `/api/dashboard` | Oui  | —    | Tableau de bord |

### Médecins

| Méthode | Endpoint                 | Auth | Rôle  | Description                    |
| -------- | ------------------------ | ---- | ------ | ------------------------------ |
| GET      | `/api/doctors`         | Non  | Public | Liste des médecins validés   |
| GET      | `/api/doctors/:id`     | Non  | Public | Détail d'un médecin          |
| GET      | `/api/doctors/me`      | Oui  | DOCTOR | Profil du médecin connecté   |
| PUT      | `/api/doctors/profile` | Oui  | DOCTOR | Compléter son profil médecin |

### Disponibilités

| Méthode | Endpoint                           | Auth | Rôle  | Description             |
| -------- | ---------------------------------- | ---- | ------ | ----------------------- |
| POST     | `/api/availabilities`            | Oui  | DOCTOR | Ajouter un créneau     |
| GET      | `/api/availabilities/mine`       | Oui  | DOCTOR | Mes créneaux           |
| GET      | `/api/availabilities/doctor/:id` | Non  | Public | Créneaux d'un médecin |
| PUT      | `/api/availabilities/:id`        | Oui  | DOCTOR | Modifier un créneau    |
| DELETE   | `/api/availabilities/:id`        | Oui  | DOCTOR | Supprimer un créneau   |

### Rendez-vous

| Méthode | Endpoint                           | Auth | Rôle   | Description                        |
| -------- | ---------------------------------- | ---- | ------- | ---------------------------------- |
| POST     | `/api/appointments`              | Oui  | PATIENT | Créer un rendez-vous              |
| GET      | `/api/appointments/patient`      | Oui  | PATIENT | Historique de mes rendez-vous      |
| PUT      | `/api/appointments/:id`          | Oui  | PATIENT | Modifier un rendez-vous            |
| DELETE   | `/api/appointments/:id`          | Oui  | PATIENT | Annuler un rendez-vous             |
| GET      | `/api/appointments/doctor`       | Oui  | DOCTOR  | Rendez-vous reçus                 |
| PUT      | `/api/appointments/:id/confirm`  | Oui  | DOCTOR  | Confirmer + générer salle vidéo |
| PUT      | `/api/appointments/:id/complete` | Oui  | DOCTOR  | Terminer un rendez-vous            |

### Dossier médical

| Méthode | Endpoint                              | Auth | Rôle   | Description               |
| -------- | ------------------------------------- | ---- | ------- | ------------------------- |
| GET      | `/api/medical-records/:patientId`   | Oui  | PATIENT | Mon dossier médical      |
| PUT      | `/api/medical-records/:patientId`   | Oui  | DOCTOR  | Mettre à jour un dossier |
| GET      | `/api/medical-reports/:patientId`   | Oui  | PATIENT | Mes rapports médicaux    |
| POST     | `/api/medical-reports`              | Oui  | DOCTOR  | Ajouter un rapport        |
| GET      | `/api/medical-results/:patientId`   | Oui  | PATIENT | Mes résultats d'analyses |
| POST     | `/api/medical-results`              | Oui  | DOCTOR  | Ajouter un résultat      |
| GET      | `/api/medical-documents/:patientId` | Oui  | PATIENT | Mes documents             |
| POST     | `/api/medical-documents`            | Oui  | DOCTOR  | Ajouter un document       |

### Messagerie

| Méthode | Endpoint                                      | Auth | Rôle          | Description                 |
| -------- | --------------------------------------------- | ---- | -------------- | --------------------------- |
| GET      | `/api/messages/conversations`               | Oui  | PATIENT/DOCTOR | Liste des conversations     |
| GET      | `/api/messages/conversation/:appointmentId` | Oui  | PATIENT/DOCTOR | Messages d'une conversation |
| POST     | `/api/messages`                             | Oui  | PATIENT/DOCTOR | Envoyer un message          |

### Assistant IA

| Méthode | Endpoint                  | Auth | Rôle   | Description                |
| -------- | ------------------------- | ---- | ------- | -------------------------- |
| POST     | `/api/ai/pre-diagnosis` | Oui  | PATIENT | Analyse des symptômes     |
| GET      | `/api/ai/history`       | Oui  | PATIENT | Historique des diagnostics |
| GET      | `/api/ai/:id`           | Oui  | PATIENT | Détail d'un diagnostic    |

### Téléconsultation

| Méthode | Endpoint                                          | Auth | Rôle          | Description              |
| -------- | ------------------------------------------------- | ---- | -------------- | ------------------------ |
| GET      | `/api/teleconsultation/:appointmentId`          | Oui  | PATIENT/DOCTOR | Infos de la salle vidéo |
| POST     | `/api/teleconsultation/:appointmentId/generate` | Oui  | PATIENT/DOCTOR | Générer un lien vidéo |

### Administration

| Méthode | Endpoint                            | Auth | Rôle | Description                       |
| -------- | ----------------------------------- | ---- | ----- | --------------------------------- |
| GET      | `/api/admin/doctors`              | Oui  | ADMIN | Tous les médecins                |
| PUT      | `/api/admin/doctors/:id/validate` | Oui  | ADMIN | Valider / désactiver un médecin |

---

## 🛠️ Stack technique

### Frontend

- **React 18** — Bibliothèque UI
- **React Router v6** — Routage côté client
- **Axios** — Client HTTP avec intercepteurs JWT
- **CSS3** — Variables CSS, flexbox, grid, animations
- **Design** : Interface type Messenger/Instagram, thème médical bleu/teal

### Backend

- **Node.js + Express** — Serveur REST
- **JWT (JSON Web Tokens)** — Authentification sans état
- **bcryptjs** — Hachage des mots de passe
- **Middleware** : Auth par rôle (PATIENT, DOCTOR, ADMIN)

### Base de données

- **PostgreSQL 15** — Base de données relationnelle
- **Tables** : `users`, `doctors`, `availabilities`, `appointments`, `medical_records`, `medical_reports`, `medical_documents`, `medical_results`, `messages`, `ai_diagnoses`
- **Indexation** : Index sur les clés étrangères et les colonnes de recherche
- **Contraintes** : `CHECK` sur les rôles, statuts, niveaux de risque

### Infrastructure

- **Docker Compose** — 3 conteneurs (db, backend, frontend)
- **Ports** : 3000 (frontend), 5000 (backend), 5432 (PostgreSQL)

---

## 📝 Modules complétés

- [X] Authentification & rôles (JWT)
- [X] Recherche publique de médecins
- [X] Gestion des disponibilités (médecin)
- [X] Prise de rendez-vous (patient)
- [X] Confirmation et gestion des rendez-vous (médecin)
- [X] Dossier médical électronique
- [X] Messagerie patient-médecin
- [X] Assistant IA de pré-diagnostic
- [X] Téléconsultation vidéo (Jitsi Meet)
- [X] Administration des médecins

### Suggestions futures

- Notifications par email
- Messagerie en temps réel (WebSocket)
- Paiement en ligne des consultations
- Application mobile (React Native)
- Multi-langue (FR/EN)
- Export PDF du dossier médical
- Visioconférence native (WebRTC)

---

## 📄 Licence

Projet réalisé dans un cadre éducatif.
