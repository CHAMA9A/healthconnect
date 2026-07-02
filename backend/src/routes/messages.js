const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Accessible à PATIENT et DOCTOR (pas ADMIN)
router.get("/conversations", auth(), messageController.getConversations);
router.get("/conversation/:appointmentId", auth(), messageController.getConversation);
router.post("/", auth(), messageController.create);

module.exports = router;