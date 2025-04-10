require('dotenv').config(); // ✅ Load .env variables

const express = require('express');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
    res.send("🚀 Justice Chatbot Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
