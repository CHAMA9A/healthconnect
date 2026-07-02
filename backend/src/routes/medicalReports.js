const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/medicalReportController");
const auth = require("../middleware/auth");

router.post("/", auth("DOCTOR"), ctrl.create);
router.get("/patient/:patientId", auth(), ctrl.getByPatient);

module.exports = router;