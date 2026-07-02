const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const auth = require("../middleware/auth");

// Public (accessible sans authentification)
router.get("/", doctorController.getDoctors);

// Médecin uniquement (doit être AVANT /:id pour éviter le conflit)
router.get("/me", auth("DOCTOR"), doctorController.getMyProfile);
router.put("/profile", auth("DOCTOR"), doctorController.updateProfile);

// Public (doit être APRÈS /me)
router.get("/:id", doctorController.getDoctor);

module.exports = router;