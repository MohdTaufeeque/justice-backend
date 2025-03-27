const express = require('express');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbot'); // ✅ Ensure correct path

const app = express();
const PORT = process.env.PORT || 5000; // Changed default to 5000 (Render default)

app.use(cors());
app.use(express.json());

// ✅ Routes Setup
app.use('/chatbot', chatbotRoutes); // Ensure chatbotRoutes is correct

// ✅ Root Route for Testing
app.get('/', (req, res) => {
    res.send("🚀 Justice Chatbot Backend is Running!");
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
