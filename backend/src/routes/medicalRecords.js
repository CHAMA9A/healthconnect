const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/medicalRecordController");
const auth = require("../middleware/auth");

router.get("/me", auth("PATIENT"), ctrl.getMyRecord);
router.put("/me", auth("PATIENT"), ctrl.updateMyRecord);
router.get("/patient/:patientId", auth("DOCTOR"), ctrl.getPatientRecord);
router.get("/doctors/patients", auth("DOCTOR"), ctrl.getDoctorPatients);

module.exports = router;