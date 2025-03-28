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
            return res.json({ results: [{ title: "Hello! How may I assist you today?" }], source: 'greeting' });
        }

        // ✅ Extract IPC Section Number
        const sectionNumberMatch = userQuestion.match(/(?:section|धारा)?\s*(\d+)/i);
        const sectionNumber = sectionNumberMatch ? sectionNumberMatch[1] : null;

        if (!sectionNumber) {
            return res.json({ results: [{ title: "❌ Please enter a valid IPC section number." }], source: 'fallback' });
        }

        console.log("🔹 Extracted Section Number:", sectionNumber);

        // ✅ Check in JSON Data
        const ipcSection = ipcData.find(section => section.id === sectionNumber);
        if (ipcSection) {
            return res.json({
                results: [{ 
                    title: `📜 IPC Section ${sectionNumber}`,
                    description: ipcSection.description,
                    link: ipcSection.link // Added link to response
                }],
                source: 'json'
            });
        }

        // ✅ If not in JSON, fetch from API
        const apiResults = await fetchFromIndianKanoon(sectionNumber);
        if (apiResults && apiResults.length > 0) {
            const formattedResults = apiResults.map(result => ({
                title: `📜 IPC Section ${sectionNumber}`,
                description: result.description,
                link: result.link
            }));
            return res.json({ results: formattedResults, source: 'api' });
        }

        // ✅ If nothing found
        return res.json({ results: [{ title: `❌ No information found for Section ${sectionNumber}.` }], source: 'not_found' });

    } catch (error) {
        console.error("❌ Error in chatbotController:", error.message);
        return res.status(500).json({ results: [{ title: "❌ Server error. Please try again later." }] });
    }
};