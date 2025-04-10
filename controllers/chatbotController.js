const ipcData = require('../data/ipc_sections.json');
const { fetchFromIndianKanoon } = require('../utils/fetchData');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.askQuestion = async (req, res) => {
    try {
        const question = req.body.question?.trim();
        if (!question) {
            return res.status(400).json({ results: [{ title: "❌ Invalid request: No question provided." }] });
        }

        const userQuestion = question.toLowerCase();
        console.log("🔹 User Question:", userQuestion);

        // 1. Greetings
        const greetings = ["hi", "hello", "hey", "namaste", "salam"];
        if (greetings.includes(userQuestion)) {
            return res.json({ results: [{ title: "👋 Hello! How may I assist you today?" }], source: 'greeting' });
        }

        // 2. Detect if user is asking about a specific IPC section
        const sectionMatch = userQuestion.match(/(?:section|धारा)?\s*(\d{1,4})\b/);
        const sectionNumber = sectionMatch ? sectionMatch[1] : null;

        if (sectionNumber && (userQuestion.includes("section") || userQuestion.includes("धारा") || userQuestion.match(/^\d{1,4}$/))) {
            console.log("🔹 Extracted Section Number:", sectionNumber);

            const ipcSection = ipcData.find(section => section.id === sectionNumber);
            if (ipcSection) {
                return res.json({
                    results: [{
                        title: `📜 IPC Section ${sectionNumber}`,
                        description: ipcSection.description,
                        link: ipcSection.link
                    }],
                    source: 'json'
                });
            }

            const apiResults = await fetchFromIndianKanoon(sectionNumber);
            if (apiResults && apiResults.length > 0) {
                const formattedResults = apiResults.map(result => ({
                    title: `📜 IPC Section ${sectionNumber}`,
                    description: result.description,
                    link: result.link
                }));
                return res.json({ results: formattedResults, source: 'api' });
            }

            return res.json({ results: [{ title: `❌ No information found for Section ${sectionNumber}.` }], source: 'not_found' });
        }

        // 3. Fallback to Gemini for general legal questions
        console.log("🔁 Forwarding to Gemini API...");
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: userQuestion }] }] }
        );

        const geminiText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Gemini could not answer this.";
        return res.json({ results: [{ title: geminiText }], source: 'gemini' });

    } catch (error) {
        console.error("❌ Error in chatbotController:", error.message);
        return res.status(500).json({ results: [{ title: "❌ Server error. Please try again later." }] });
    }
};
