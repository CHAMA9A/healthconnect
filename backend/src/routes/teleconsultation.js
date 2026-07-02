const express = require("express");
const router = express.Router();
const teleconsultationController = require("../controllers/teleconsultationController");
const auth = require("../middleware/auth");

// Accessible à PATIENT et DOCTOR (pas ADMIN)
router.get("/:appointmentId", auth(), teleconsultationController.getInfo);
router.post("/:appointmentId/generate", auth(), teleconsultationController.generate);

module.exports = router;