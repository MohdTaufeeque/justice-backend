require('dotenv').config(); // ✅ Load .env variables

const express = require('express');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS for Netlify frontend
app.use(cors({
    origin: 'https://dynamic-macaron-abcef5.netlify.app', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// ✅ Routes
app.use('/chatbot', chatbotRoutes);

// ✅ Root test route
app.get('/', (req, res) => {
    res.send("🚀 Justice Chatbot Backend is Running!");
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
