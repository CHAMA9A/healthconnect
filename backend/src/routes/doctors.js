const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const auth = require("../middleware/auth");

// Public (accessible sans authentification)
router.get("/", doctorController.getDoctors);
router.get("/:id", doctorController.getDoctor);

// Médecin uniquement
router.put("/profile", auth("DOCTOR"), doctorController.updateProfile);
router.get("/me", auth("DOCTOR"), doctorController.getMyProfile);

module.exports = router;