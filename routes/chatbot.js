const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController'); // ✅ Correct Import

// ✅ Define the /ask route properly
router.post('/ask', chatbotController.askQuestion);

module.exports = router;
