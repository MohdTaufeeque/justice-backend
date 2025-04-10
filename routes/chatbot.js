const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// ✅ Final route
router.post('/askQuestion', chatbotController.askQuestion);

module.exports = router;
