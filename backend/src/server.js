const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const doctorRoutes = require("./routes/doctors");
const availabilityRoutes = require("./routes/availabilities");
const appointmentRoutes = require("./routes/appointments");
const adminRoutes = require("./routes/admin");
const medicalRecordRoutes = require("./routes/medicalRecords");
const medicalReportRoutes = require("./routes/medicalReports");
const medicalDocumentRoutes = require("./routes/medicalDocuments");
const medicalResultRoutes = require("./routes/medicalResults");
const messageRoutes = require("./routes/messages");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API HealthConnect 🏥" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/medical-reports", medicalReportRoutes);
app.use("/api/medical-documents", medicalDocumentRoutes);
app.use("/api/medical-results", medicalResultRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur HealthConnect démarré sur http://localhost:${PORT}`);
});