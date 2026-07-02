                                                           

 

# 🏥 HealthConnect

**HealthConnect** est une plateforme de santé connectée permettant aux patients de prendre rendez-vous avec des médecins, consulter leur dossier médical, échanger via messagerie et accéder à des téléconsultations.

> Projet MVP étudiant — Stack : React.js + Express + PostgreSQL

---

## 📁 Architecture du projet

```
healthconnect/
├── backend/                  # API Express
│   ├── src/
│   │   ├── config/           # Configuration (base de données)
│   │   ├── controllers/      # Logique métier
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── doctorController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── appointmentController.js
│   │   │   └── adminController.js
│   │   ├── middleware/        # Middleware (auth JWT)
│   │   ├── models/           # Modèles de données
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   ├── Availability.js
│   │   │   └── Appointment.js
│   │   ├── routes/           # Routes de l'API
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── doctors.js
│   │   │   ├── availabilities.js
│   │   │   ├── appointments.js
│   │   │   └── admin.js
│   │   └── server.js         # Point d'entrée du serveur
│   ├── .env.example          # Variables d'environnement (exemple)
│   └── package.json
├── frontend/                 # Application React
│   ├── public/
│   ├── src/
│   │   ├── api/              # Configuration Axios
│   │   ├── context/          # Contexte React (authentification)
│   │   ├── pages/            # Pages (Home, Login, Register, Dashboard)
│   │   └── styles/           # Fichiers CSS
│   └── package.json
├── database/
│   ├── init.sql              # Script de création de la base de données
│   └── docker-init.sql       # Version allégée pour Docker
├── backend/
│   ├── Dockerfile            # Image Node.js pour le backend
│   └── ...
├── frontend/
│   ├── Dockerfile            # Image Node.js pour le frontend
│   └── ...
├── docker-compose.yml        # Orchestration Docker (db + backend + frontend)
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

La base de données et les tables sont créées automatiquement au premier lancement.

---

### Option 2 — Manuellement (sans Docker)

**Prérequis :**
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou supérieur)

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd healthconnect
```

### 2. Configurer la base de données

```bash
# Créer la base de données et les tables
psql -U postgres -f database/init.sql
```

### 3. Configurer le backend

```bash
cd backend

# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec vos informations PostgreSQL
nano .env
```

Contenu du fichier `.env` :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthconnect
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=une_cle_secrete_tres_longue
JWT_EXPIRES_IN=7d
```

```bash
# Installer les dépendances
npm install

# Lancer le serveur (mode développement)
npm run dev
```

Le serveur démarre sur **http://localhost:5000**.

### 4. Configurer le frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

L'application démarre sur **http://localhost:3000**.

---

## 👥 Rôles utilisateurs

| Rôle   | Description                                               |
| ------ | --------------------------------------------------------- |
| PATIENT | Recherche des médecins, prise de rendez-vous, historique |
| DOCTOR  | Profil, disponibilités, gestion des rendez-vous reçus    |
| ADMIN   | Validation et gestion des comptes médecins               |

---

## 🧪 API Endpoints

### Authentification

| Méthode | Endpoint             | Auth | Description                  |
| ------- | -------------------- | ---- | ---------------------------- |
| POST    | `/api/auth/register` | Non  | Inscription                  |
| POST    | `/api/auth/login`    | Non  | Connexion                    |
| GET     | `/api/auth/me`       | Oui  | Profil utilisateur connecté  |
| GET     | `/api/dashboard`     | Oui  | Tableau de bord              |

### Médecins

| Méthode | Endpoint              | Auth     | Description                          |
| ------- | --------------------- | -------- | ------------------------------------ |
| GET     | `/api/doctors`        | Oui      | Liste des médecins validés           |
| GET     | `/api/doctors/:id`    | Oui      | Détail d'un médecin                  |
| PUT     | `/api/doctors/profile`| DOCTOR   | Compléter son profil médecin         |
| GET     | `/api/doctors/me`     | DOCTOR   | Profil du médecin connecté           |

### Disponibilités

| Méthode | Endpoint                             | Auth     | Description                       |
| ------- | ------------------------------------ | -------- | --------------------------------- |
| POST    | `/api/availabilities`                | DOCTOR   | Ajouter un créneau                |
| GET     | `/api/availabilities/doctor/:id`     | Oui      | Créneaux d'un médecin             |
| PUT     | `/api/availabilities/:id`            | DOCTOR   | Modifier un créneau               |
| DELETE  | `/api/availabilities/:id`            | DOCTOR   | Supprimer un créneau              |

### Rendez-vous

| Méthode | Endpoint                          | Auth     | Description                        |
| ------- | --------------------------------- | -------- | ---------------------------------- |
| POST    | `/api/appointments`               | PATIENT  | Créer un rendez-vous               |
| GET     | `/api/appointments/patient`       | PATIENT  | Historique de mes rendez-vous      |
| PUT     | `/api/appointments/:id`           | PATIENT  | Modifier un rendez-vous            |
| DELETE  | `/api/appointments/:id`           | PATIENT  | Annuler un rendez-vous             |
| GET     | `/api/appointments/doctor`        | DOCTOR   | Rendez-vous reçus                  |
| PUT     | `/api/appointments/:id/confirm`   | DOCTOR   | Confirmer un rendez-vous           |
| PUT     | `/api/appointments/:id/complete`  | DOCTOR   | Terminer un rendez-vous            |

### Administration

| Méthode | Endpoint                          | Auth   | Description                        |
| ------- | --------------------------------- | ------ | ---------------------------------- |
| GET     | `/api/admin/doctors`              | ADMIN  | Tous les médecins (validations)    |
| PUT     | `/api/admin/doctors/:id/validate` | ADMIN  | Valider / désactiver un médecin    |

---

## 🛠️ Stack technique

- **Frontend :** React 18, React Router v6, Axios
- **Backend :** Node.js, Express, JWT, bcryptjs
- **Base de données :** PostgreSQL (via `pg`) — tables : `users`, `doctors`, `availabilities`, `appointments`
- **Sécurité :** JWT avec Bearer token, mots de passe hashés (bcrypt), routes protégées par rôle

---

## 📝 Prochaines étapes

- [x] Prise de rendez-vous
- [ ] Dossier médical électronique
- [ ] Messagerie en temps réel
- [ ] Assistant IA de pré-diagnostic
- [ ] Téléconsultation vidéo
- [ ] Notifications email

---

## 📄 Licence

Projet réalisé dans un cadre éducatif.