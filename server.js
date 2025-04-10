require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - allow Netlify frontend
app.use(cors({
    origin: 'https://dynamic-macaron-abcef5.netlify.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(express.json());

// ✅ API Routes
app.use('/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
    res.send("🚀 Justice Chatbot Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
