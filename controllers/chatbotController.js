const ipcData = require('../data/ipc_sections.json');
const { fetchFromIndianKanoon } = require('../utils/fetchData');
const { askGemini } = require('../utils/gemini');

exports.askQuestion = async (req, res) => {
  try {
    if (!req.body.question) {
      return res.status(400).json({ 
        results: [{ 
          title: "❌ Invalid request", 
          description: "No question provided." 
        }] 
      });
    }

    const userQuestion = req.body.question.trim();
    console.log("User Question:", userQuestion);

    // Handle greetings in both English and Hindi
    const englishGreetings = ["hi", "hello", "hey"];
    const hindiGreetings = ["namaste", "namaskar", "salam", "pranam"];
    
    // Improved Hindi detection
    const isHindi = /[\u0900-\u097F]/.test(userQuestion) || 
                   hindiGreetings.some(greet => userQuestion.toLowerCase().includes(greet)) ||
                   userQuestion.toLowerCase().includes('हिंदी') || 
                   userQuestion.toLowerCase().includes('hindi');

    if ([...englishGreetings, ...hindiGreetings].some(greet => userQuestion.toLowerCase().includes(greet))) {
      return res.json({ 
        results: [{ 
          title: isHindi ? "👋 नमस्ते! मैं आपका न्याय सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" 
                   : "👋 Hello! I'm your Justice Assistant. How may I help you today?"
        }], 
        source: 'greeting' 
      });
    }

    // Handle section queries
    const sectionNumberMatch = userQuestion.match(/(?:section|धारा|सेक्शन)?\s*(\d+)/i);
    const sectionNumber = sectionNumberMatch ? sectionNumberMatch[1] : null;

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

      // Try Indian Kanoon if not found in JSON
      try {
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
      } catch (apiError) {
        console.error("Indian Kanoon API error:", apiError);
      }

      return res.json({ 
        results: [{ 
          title: isHindi ? `❌ धारा ${sectionNumber} नहीं मिली` 
                   : `❌ Section ${sectionNumber} not found`,
          description: isHindi ? "यह धारा हमारे डेटाबेस में मौजूद नहीं है।"
                   : "This section doesn't exist in our database."
        }], 
        source: 'not_found' 
      });
    }

    // Handle all other queries with Gemini
    const geminiReply = await askGemini(isHindi ? 
      `कृपया हिंदी में उत्तर दें: ${userQuestion}` : 
      userQuestion);
      
    return res.json({ 
      results: [{ 
        title: geminiReply 
      }], 
      source: 'gemini' 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ 
      results: [{ 
        title: "⚠️ Sorry, I'm having trouble processing your request. Please try again later." 
      }] 
    });
  }
};