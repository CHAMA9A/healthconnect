const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");
const auth = require("../middleware/auth");

// Médecin uniquement
router.post("/", auth("DOCTOR"), availabilityController.create);
router.put("/:id", auth("DOCTOR"), availabilityController.update);
router.delete("/:id", auth("DOCTOR"), availabilityController.remove);

// Public (accessible sans authentification)
router.get("/doctor/:doctorId", availabilityController.getByDoctor);

module.exports = router;