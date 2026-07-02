const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

router.get("/doctors", auth("ADMIN"), adminController.getDoctors);
router.put("/doctors/:id/validate", auth("ADMIN"), adminController.validateDoctor);

module.exports = router;