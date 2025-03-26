const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route to handle user questions
router.post('/ask', chatbotController.askQuestion);

module.exports = router;
