const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const auth = require("../middleware/auth");

// Patient
router.post("/", auth("PATIENT"), appointmentController.create);
router.get("/patient", auth("PATIENT"), appointmentController.getPatientAppointments);
router.put("/:id", auth("PATIENT"), appointmentController.update);
router.delete("/:id", auth("PATIENT"), appointmentController.cancel);

// Médecin
router.get("/doctor", auth("DOCTOR"), appointmentController.getDoctorAppointments);
router.put("/:id/confirm", auth("DOCTOR"), appointmentController.confirm);
router.put("/:id/complete", auth("DOCTOR"), appointmentController.complete);

module.exports = router;