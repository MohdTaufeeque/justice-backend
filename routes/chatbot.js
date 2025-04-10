const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// ✅ Updated route as per your requirement
router.post('/askQuestion', chatbotController.askQuestion);

module.exports = router;
