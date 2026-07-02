const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");

// Seul un PATIENT peut accéder à ces routes
router.post("/pre-diagnosis", auth("PATIENT"), aiController.createPreDiagnosis);
router.get("/history", auth("PATIENT"), aiController.getHistory);
router.get("/:id", auth("PATIENT"), aiController.getById);

module.exports = router;