const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Use the PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

const app = express();

// --- Middleware ---
// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per 15 minutes per IP
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

// CORS configuration to allow requests from your front-end
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Body parser to handle JSON requests
app.use(express.json());

// Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional: Clean routes for pages
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history1.html'));
});

// --- Connect to MongoDB ---
mongoose.connect('mongodb://localhost:27017/doj_website_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- Mongoose Schemas and Models ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// New schema for search history, separate from chat messages
const searchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: { type: String, required: true }, // Stores the user's search term (e.g., '302')
    timestamp: { type: Date, default: Date.now }
});
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

// --- API Endpoints ---

// User Registration
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        // Return userId and username on successful login
        res.status(200).json({ success: true, message: 'Login successful!', userId: user._id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Save a new chat message
app.post('/api/save-chat', async (req, res) => {
    try {
        const { userId, message, sender } = req.body;
        const newChat = new ChatHistory({ userId, message, sender });
        await newChat.save();
        res.status(201).json({ message: 'Chat message saved successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving chat message.' });
    }
});

// New API endpoint to save a search query
app.post('/api/save-search', async (req, res) => {
    try {
        const { userId, query } = req.body;
        const newSearch = new SearchHistory({ userId, query });
        await newSearch.save();
        res.status(201).json({ message: 'Search query saved successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving search query.' });
    }
});

// Get chat history for a specific user
app.get('/api/get-chat-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await ChatHistory.find({ userId }).sort({ timestamp: 1 });
        res.status(200).json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching chat history.' });
    }
});

// New API endpoint to get search history for a specific user
app.get('/api/get-search-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await SearchHistory.find({ userId }).sort({ timestamp: -1 }); // -1 for descending order (most recent first)
        res.status(200).json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching search history.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
