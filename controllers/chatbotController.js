const ipcData = require('../data/ipc_sections.json');
const { fetchFromIndianKanoon } = require('../utils/fetchData');
const { askGemini } = require('../utils/gemini'); // ✅ Gemini function

exports.askQuestion = async (req, res) => {
    try {
        const userQuestion = req.body.question?.toLowerCase();

        if (!userQuestion) {
            return res.status(400).json({
                results: [{ title: "❌ Invalid request: No question provided." }]
            });
        }

        console.log("🔹 User Question:", userQuestion);

        // ✅ Simple greeting
        const greetings = ["hi", "hello", "hey", "namaste", "salam"];
        if (greetings.includes(userQuestion.trim())) {
            return res.json({
                results: [{ title: "👋 Hello! How may I assist you today?" }],
                source: 'greeting'
            });
        }

        // ✅ Try IPC section match
        const sectionMatch = userQuestion.match(/(?:section|धारा)?\s*(\d+)/i);
        const sectionNumber = sectionMatch ? sectionMatch[1] : null;

        if (sectionNumber) {
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
            if (apiResults?.length > 0) {
                return res.json({
                    results: apiResults.map(result => ({
                        title: `📜 IPC Section ${sectionNumber}`,
                        description: result.description,
                        link: result.link
                    })),
                    source: 'api'
                });
            }

            return res.json({
                results: [{ title: `❌ No information found for Section ${sectionNumber}.` }],
                source: 'not_found'
            });
        }

        // ✅ General legal questions → Gemini API
        const geminiAnswer = await askGemini(userQuestion);
        return res.json({
            results: [{ title: geminiAnswer }],
            source: 'gemini'
        });

    } catch (error) {
        console.error("❌ Error in chatbotController:", error.message);
        return res.status(500).json({
            results: [{ title: "❌ Server error. Please try again later." }]
        });
    }
};
