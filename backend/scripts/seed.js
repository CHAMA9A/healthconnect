// ============================================================
// HealthConnect - Script de seed (idempotent)
// ============================================================
// Usage : node scripts/seed.js
// Les dates sont calculées en JavaScript pour éviter l'erreur
// PostgreSQL : "operator is not unique: date + unknown"
// ============================================================

const bcrypt = require("bcryptjs");
const pool = require("../src/config/database");

// -------- Utilitaires --------

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

// -------- Données de seed --------

const adminData = {
  first_name: "Admin",
  last_name: "System",
  email: "admin@healthconnect.fr",
  password: "admin123",
  role: "ADMIN",
};

const patientsData = [
  { first_name: "Alice", last_name: "Durand", email: "alice@test.fr", password: "test123", role: "PATIENT" },
  { first_name: "Bob", last_name: "Martin", email: "bob@test.fr", password: "test123", role: "PATIENT" },
  { first_name: "Claire", last_name: "Petit", email: "claire@test.fr", password: "test123", role: "PATIENT" },
];

const doctorsData = [
  {
    user: { first_name: "Sophie", last_name: "Leroy", email: "dr.leroy@healthconnect.fr", password: "doc123", role: "DOCTOR" },
    profile: { speciality: "Généraliste", description: "Médecin généraliste disponible pour consultations", address: "12 Rue de la Paix, 75001 Paris", phone: "0123456789" },
  },
  {
    user: { first_name: "Thomas", last_name: "Moreau", email: "dr.moreau@healthconnect.fr", password: "doc123", role: "DOCTOR" },
    profile: { speciality: "Cardiologue", description: "Cardiologue avec 15 ans d'expérience", address: "45 Avenue des Ternes, 75017 Paris", phone: "0145678901" },
  },
  {
    user: { first_name: "Julie", last_name: "Bernard", email: "dr.bernard@healthconnect.fr", password: "doc123", role: "DOCTOR" },
    profile: { speciality: "Dermatologue", description: "Dermatologue spécialisée en médecine esthétique", address: "8 Boulevard Haussmann, 75009 Paris", phone: "0198765432" },
  },
];

// Les créneaux horaires pour les disponibilités
const timeSlots = [
  { start: 9, end: 10 },
  { start: 10, end: 11 },
  { start: 11, end: 12 },
  { start: 14, end: 15 },
  { start: 15, end: 16 },
  { start: 16, end: 17 },
];

// -------- Fonctions helpers --------

async function upsertUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       password = EXCLUDED.password,
       role = EXCLUDED.role
     RETURNING id, email, role`,
    [userData.first_name, userData.last_name, userData.email, hashedPassword, userData.role]
  );
  return result.rows[0];
}

async function upsertDoctorProfile(userId, profileData) {
  const result = await pool.query(
    `INSERT INTO doctors (user_id, speciality, description, address, phone, is_validated)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     ON CONFLICT (user_id) DO UPDATE SET
       speciality = EXCLUDED.speciality,
       description = EXCLUDED.description,
       address = EXCLUDED.address,
       phone = EXCLUDED.phone,
       is_validated = TRUE
     RETURNING id`,
    [userId, profileData.speciality, profileData.description, profileData.address, profileData.phone]
  );
  return result.rows[0];
}

// -------- Main --------

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Début du seed HealthConnect...\n");

    // ---- 1. Créer les utilisateurs ----

    console.log("--- 1. Création des utilisateurs ---");

    const admin = await upsertUser(adminData);
    console.log(`  ✅ Admin : ${admin.email} (id=${admin.id})`);

    const patients = [];
    for (const p of patientsData) {
      const user = await upsertUser(p);
      patients.push(user);
      console.log(`  ✅ Patient : ${user.email} (id=${user.id})`);
    }

    const doctorUsers = [];
    for (const doc of doctorsData) {
      const user = await upsertUser(doc.user);
      doctorUsers.push({ user, profile: doc.profile });
      console.log(`  ✅ Docteur : ${user.email} (id=${user.id})`);
    }

    // ---- 2. Créer les profils docteurs ----

    console.log("\n--- 2. Création des profils docteurs ---");

    const doctors = [];
    for (const du of doctorUsers) {
      const doctor = await upsertDoctorProfile(du.user.id, du.profile);
      doctors.push(doctor);
      console.log(`  ✅ Profil docteur créé (doctor_id=${doctor.id}) pour ${du.user.email}`);
    }

    // ---- 3. Créer les disponibilités (JAVASCRIPT DATES - pas de CURRENT_DATE + x) ----

    console.log("\n--- 3. Création des disponibilités ---");

    for (const doctor of doctors) {
      let count = 0;
      // Créer des disponibilités pour les 7 prochains jours
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const slotDate = addDays(today, dayOffset);
        // Ne pas mettre de créneaux le dimanche
        if (slotDate.getDay() === 0) continue;

        const dateStr = formatDate(slotDate);

        for (const slot of timeSlots) {
          // Certains créneaux omis aléatoirement pour varier
          if (Math.random() < 0.2) continue;

          await pool.query(
            `INSERT INTO availabilities (doctor_id, date, start_time, end_time)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [doctor.id, dateStr, formatTime(slot.start, 0), formatTime(slot.end, 0)]
          );
          count++;
        }
      }
      console.log(`  ✅ ${count} disponibilités créées pour doctor_id=${doctor.id}`);
    }

    // ---- 4. Créer des rendez-vous entre patients et docteurs ----

    console.log("\n--- 4. Création des rendez-vous ---");

    const appointmentReasons = [
      "Consultation de routine",
      "Douleurs au genou",
      "Suivi annuel",
      "Problème de peau",
      "Bilan cardiaque",
      "Renouvellement d'ordonnance",
    ];

    let appointmentCount = 0;
    const createdAppointments = [];

    for (let pi = 0; pi < patients.length; pi++) {
      const patient = patients[pi];
      const doctor = doctors[pi % doctors.length];

      // Créer 2 rendez-vous par patient : un passé (COMPLETED) et un futur (CONFIRMED)
      const pastDate = formatDate(addDays(today, -(pi + 2)));
      const futureDate = formatDate(addDays(today, pi + 3));

      // Rendez-vous passé (COMPLETED)
      const pastAppt = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, date, start_time, end_time, status, reason)
         VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [patient.id, doctor.id, pastDate, "09:00", "10:00", appointmentReasons[pi % appointmentReasons.length]]
      );
      if (pastAppt.rows[0]) {
        appointmentCount++;
        createdAppointments.push({ id: pastAppt.rows[0].id, patientId: patient.id, doctorId: doctor.id });
      }

      // Rendez-vous futur (CONFIRMED) avec lien téléconsultation
      const futureRoomName = `healthconnect-appointment-future-${pi}`;
      const futureVideoLink = `https://meet.jit.si/${futureRoomName}`;
      const futureAppt = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, date, start_time, end_time, status, reason, video_link, video_room_name, video_created_at)
         VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', $6, $7, $8, NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [patient.id, doctor.id, futureDate, "10:00", "11:00", appointmentReasons[(pi + 1) % appointmentReasons.length], futureVideoLink, futureRoomName]
      );
      if (futureAppt.rows[0]) {
        appointmentCount++;
        createdAppointments.push({ id: futureAppt.rows[0].id, patientId: patient.id, doctorId: doctor.id });
      }

      // Rendez-vous en attente (PENDING)
      const pendingDate = formatDate(addDays(today, 10 + pi));
      const pendingAppt = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, date, start_time, end_time, status, reason)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [patient.id, doctor.id, pendingDate, "14:00", "15:00", "Consultation de suivi"]
      );
      if (pendingAppt.rows[0]) {
        appointmentCount++;
        createdAppointments.push({ id: pendingAppt.rows[0].id, patientId: patient.id, doctorId: doctor.id });
      }
    }

    console.log(`  ✅ ${appointmentCount} rendez-vous créés`);

    // ---- 5. Créer les dossiers médicaux ----

    console.log("\n--- 5. Création des dossiers médicaux ---");

    const medicalHistories = [
      { history: "Asthme depuis l'enfance. Appendicectomie en 2018.", allergies: "Pollen, acariens, pénicilline", treatments: "Ventoline quotidienne" },
      { history: "Hypertension artérielle diagnostiquée en 2020. Pas d'antécédents chirurgicaux.", allergies: "Aucune allergie connue", treatments: "Lisinopril 10mg/jour" },
      { history: "Diabète de type 2. Fracture du poignet gauche en 2021.", allergies: "Sulfamides", treatments: "Metformine 850mg x2/jour" },
    ];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const medHistory = medicalHistories[i % medicalHistories.length];

      await pool.query(
        `INSERT INTO medical_records (patient_id, history, allergies, treatments)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (patient_id) DO UPDATE SET
           history = EXCLUDED.history,
           allergies = EXCLUDED.allergies,
           treatments = EXCLUDED.treatments,
           updated_at = NOW()
         RETURNING id`,
        [patient.id, medHistory.history, medHistory.allergies, medHistory.treatments]
      );
      console.log(`  ✅ Dossier médical créé pour patient_id=${patient.id}`);
    }

    // ---- 6. Créer des rapports médicaux ----

    console.log("\n--- 6. Création des rapports médicaux ---");

    const reportTemplates = [
      { title: "Compte rendu de consultation", content: "Patient vu en consultation pour douleur au genou. Examen clinique normal. Prescription d'anti-inflammatoires." },
      { title: "Résultat d'examen", content: "Les examens sanguins sont dans les normes. Pas d'anomalie détectée. Contrôle dans 6 mois." },
      { title: "Suivi de traitement", content: "Le traitement actuel est bien toléré. Poursuite du même protocole. Prochain rendez-vous dans 3 mois." },
    ];

    for (const appt of createdAppointments) {
      const template = reportTemplates[Math.floor(Math.random() * reportTemplates.length)];
      const doctorObj = doctors.find(d => d.id === appt.doctorId);
      if (!doctorObj) continue;

      await pool.query(
        `INSERT INTO medical_reports (patient_id, doctor_id, appointment_id, title, content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [appt.patientId, appt.doctorId, appt.id, template.title, template.content]
      );
    }

    console.log(`  ✅ ${createdAppointments.length} rapports médicaux créés`);

    // ---- 7. Créer des résultats d'analyses ----

    console.log("\n--- 7. Création des résultats d'analyses ---");

    const resultTemplates = [
      { title: "Glycémie à jeun", resultValue: "0.92 g/L", comment: "Valeur normale (0.70 - 1.10 g/L)" },
      { title: "Cholestérol total", resultValue: "2.10 g/L", comment: "Légèrement élevé, surveiller l'alimentation" },
      { title: "Tension artérielle", resultValue: "13/8 cmHg", comment: "Normale" },
      { title: "Hémoglobine", resultValue: "14.2 g/dL", comment: "Dans les normes" },
    ];

    for (const appt of createdAppointments.slice(0, 4)) {
      const template = resultTemplates[Math.floor(Math.random() * resultTemplates.length)];
      await pool.query(
        `INSERT INTO medical_results (patient_id, doctor_id, title, result_value, comment)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [appt.patientId, appt.doctorId, template.title, template.resultValue, template.comment]
      );
    }

    console.log(`  ✅ Résultats d'analyses créés`);

    // ---- 8. Créer des documents ----

    console.log("\n--- 8. Création des documents ---");

    const documents = [
      { fileName: "ordonnance_2026.pdf", fileType: "ordonnance" },
      { fileName: "analyse_sanguine.pdf", fileType: "analyse" },
      { fileName: "radio_genou.pdf", fileType: "imagerie" },
      { fileName: "compte_rendu_hospitalisation.pdf", fileType: "rapport" },
    ];

    for (const appt of createdAppointments.slice(0, 3)) {
      const doc = documents[Math.floor(Math.random() * documents.length)];
      const fileUrl = `/uploads/${appt.patientId}/${doc.fileName}`;

      await pool.query(
        `INSERT INTO medical_documents (patient_id, file_name, file_url, file_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [appt.patientId, doc.fileName, fileUrl, doc.fileType]
      );
    }

    console.log(`  ✅ Documents créés\n`);

    // ---- 9. Créer des messages dans les conversations ----

    console.log("--- 9. Création des messages ---");

    // Construire la correspondance doctors.id → users.id
    const doctorUserMap = {};
    for (let i = 0; i < doctors.length; i++) {
      doctorUserMap[doctors[i].id] = doctorUsers[i].user.id;
    }

    const messageTemplates = [
      { patient: "Bonjour docteur, j'aimerais confirmer mon rendez-vous.", doctor: "Bonjour, c'est noté. À bientôt !" },
      { patient: "Merci pour votre consultation. J'ai une petite question sur mon traitement.", doctor: "Je vous en prie. N'hésitez pas à me poser vos questions ici même." },
      { patient: "Bonjour, je suis un peu en retard, je serai là dans 10 minutes.", doctor: "Pas de problème, je vous attendrai. Merci de prévenir." },
      { patient: "Les analyses sont-elles disponibles ?", doctor: "Oui, je les ai consultées. Tout est normal. Je vous donne plus de détails lors du prochain rendez-vous." },
    ];

    let messageCount = 0;
    for (const appt of createdAppointments) {
      const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      const doctorUserId = doctorUserMap[appt.doctorId];
      if (!doctorUserId) continue;

      // Message du patient
      await pool.query(
        `INSERT INTO messages (appointment_id, sender_id, content)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [appt.id, appt.patientId, template.patient]
      );
      messageCount++;

      // Réponse du médecin
      await pool.query(
        `INSERT INTO messages (appointment_id, sender_id, content)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [appt.id, doctorUserId, template.doctor]
      );
      messageCount++;
    }

    console.log(`  ✅ ${messageCount} messages créés\n`);

    // ---- 10. Créer des pré-diagnostics IA ----

    console.log("--- 10. Création des pré-diagnostics IA ---");

    const aiDiagnoses = [
      {
        patientIndex: 0, // Alice
        symptoms: {
          fievre: "non",
          toux: "oui",
          fatigue: "oui",
          douleur: "non",
          intensite_douleur: 0,
          difficulte_respiratoire: "non",
          duree_jours: 2,
          age: 28,
          maladie_chronique: "non",
          description_libre: "Toux sèche depuis 2 jours, un peu fatiguée",
        },
        riskLevel: "LOW",
        suggestion: "Symptômes légers (toux, fatigue). Probablement bénin.",
        recommendation:
          "Surveillez l'évolution de vos symptômes. Reposez-vous et hydratez-vous. Consultez si les symptômes s'aggravent ou persistent.",
      },
      {
        patientIndex: 1, // Bob
        symptoms: {
          fievre: "oui",
          toux: "oui",
          fatigue: "oui",
          douleur: "oui",
          intensite_douleur: 5,
          difficulte_respiratoire: "non",
          duree_jours: 5,
          age: 45,
          maladie_chronique: "oui",
          description_libre: "Fièvre modérée, toux grasse, fatigue générale, douleurs musculaires",
        },
        riskLevel: "MEDIUM",
        suggestion:
          "Symptômes modérés (fièvre, toux, fatigue, douleur, maladie chronique avec fièvre). Une consultation est conseillée.",
        recommendation:
          "Prenez rendez-vous avec votre médecin traitant dans les jours à venir pour une évaluation.",
      },
      {
        patientIndex: 2, // Claire
        symptoms: {
          fievre: "oui",
          toux: "non",
          fatigue: "oui",
          douleur: "oui",
          intensite_douleur: 8,
          difficulte_respiratoire: "oui",
          duree_jours: 3,
          age: 35,
          maladie_chronique: "non",
          description_libre: "Difficulté à respirer, forte fièvre, douleur thoracique intense",
        },
        riskLevel: "HIGH",
        suggestion:
          "Suspicion d'affection respiratoire sévère nécessitant une prise en charge rapide.",
        recommendation:
          "Consultez un médecin en urgence ou rendez-vous aux urgences si les symptômes sont graves.",
      },
    ];

    const disclaimer =
      "Ce résultat est indicatif et ne remplace pas un avis médical professionnel. En cas de doute ou de symptômes graves, consultez un médecin.";
    let aiCount = 0;

    for (const diag of aiDiagnoses) {
      const patient = patients[diag.patientIndex];
      if (!patient) continue;

      await pool.query(
        `INSERT INTO ai_diagnoses (patient_id, symptoms, risk_level, suggestion, recommendation, disclaimer)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          patient.id,
          JSON.stringify(diag.symptoms),
          diag.riskLevel,
          diag.suggestion,
          diag.recommendation,
          disclaimer,
        ]
      );
      aiCount++;
      console.log(`  ✅ Pré-diagnostic ${diag.riskLevel} pour patient_id=${patient.id}`);
    }

    console.log(`  ✅ ${aiCount} pré-diagnostics IA créés\n`);

    console.log("============================================");
    console.log("🌱 Seed terminé avec succès !");
    console.log("============================================");
    console.log("\nComptes de test :");
    console.log("  Admin  : admin@healthconnect.fr / admin123");
    console.log("  Patients : alice@test.fr / test123");
    console.log("            bob@test.fr / test123");
    console.log("            claire@test.fr / test123");
    console.log("  Docteurs : dr.leroy@healthconnect.fr / doc123");
    console.log("             dr.moreau@healthconnect.fr / doc123");
    console.log("             dr.bernard@healthconnect.fr / doc123");
    console.log("");

  } catch (err) {
    console.error("❌ Erreur pendant le seed :", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();