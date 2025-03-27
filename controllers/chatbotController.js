const ipcData = require('../data/ipc_sections.json'); // ✅ JSON Data Load
const { fetchFromIndianKanoon } = require('../utils/fetchData'); // ✅ Correct API Function

exports.askQuestion = async (req, res) => {
    try {
        if (!req.body.question) {
            return res.status(400).json({ results: [{ title: "❌ Invalid request: No question provided." }] });
        }

        const userQuestion = req.body.question.toLowerCase();
        console.log("🔹 User Question:", userQuestion);

        // ✅ Handle Simple Greetings
        const greetings = ["hi", "hello", "hey", "namaste", "salam"];
        if (greetings.includes(userQuestion)) {
            return res.json({ results: [{ title: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?" }], source: 'greeting' });
        }

        // ✅ Extract IPC Section Number
        const sectionNumberMatch = userQuestion.match(/(?:section|धारा)?\s*(\d+)/i);
        const sectionNumber = sectionNumberMatch ? sectionNumberMatch[1] : null;

        if (!sectionNumber) {
            return res.json({ results: [{ title: "❌ कृपया एक सही IPC धारा नंबर दर्ज करें।" }], source: 'fallback' });
        }

        console.log("🔹 Extracted Section Number:", sectionNumber);

        // ✅ Check in JSON Data
        const ipcSection = ipcData.find(section => section.id === sectionNumber);
        if (ipcSection) {
            return res.json({
                results: [{ 
                    title: `📜 IPC Section ${sectionNumber}`,
                    description: ipcSection.description
                }],
                source: 'json'
            });
        }

        // ✅ If not in JSON, fetch from API
        const apiResults = await fetchFromIndianKanoon(sectionNumber);
        if (apiResults && apiResults.length > 0) {
            const formattedResults = apiResults.map(result => ({
                title: `📜 <a href="${result.link}" target="_blank">${result.title}</a>`
            }));
            return res.json({ results: formattedResults, source: 'api' });
        }

        // ✅ If nothing found
        return res.json({ results: [{ title: `❌ धारा ${sectionNumber} से संबंधित कोई जानकारी नहीं मिली।` }], source: 'not_found' });

    } catch (error) {
        console.error("❌ Error in chatbotController:", error.message);
        return res.status(500).json({ results: [{ title: "❌ सर्वर में समस्या आ रही है। कृपया बाद में प्रयास करें।" }] });
    }
};
