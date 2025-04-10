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

    const userQuestion = req.body.question.trim().toLowerCase();
    console.log("User Question:", userQuestion);

    // Handle greetings in both English and Hindi
    const englishGreetings = ["hi", "hello", "hey"];
    const hindiGreetings = ["namaste", "salam", "pranam"];
    
    if ([...englishGreetings, ...hindiGreetings].some(greet => userQuestion.includes(greet))) {
      const isHindi = hindiGreetings.some(greet => userQuestion.includes(greet));
      return res.json({ 
        results: [{ 
          title: isHindi ? "👋 नमस्ते! मैं आपका न्याय सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" 
                   : "👋 Hello! I'm your Justice Assistant. How may I help you today?"
        }], 
        source: 'greeting' 
      });
    }

    // Handle section queries
    const sectionNumberMatch = userQuestion.match(/(?:section|धारा)?\s*(\d+)/i);
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
          title: `❌ Section ${sectionNumber} not found`,
          description: "This section doesn't exist in our database."
        }], 
        source: 'not_found' 
      });
    }

    // Handle language detection for Gemini
    const isHindi = /[\u0900-\u097F]/.test(userQuestion) || 
                   ["hindi", "हिंदी"].some(word => userQuestion.includes(word));

    const geminiPrompt = isHindi 
      ? `Answer in Hindi: ${userQuestion}\n\nकृपया हिंदी में उत्तर दें।`
      : userQuestion;

    const geminiReply = await askGemini(geminiPrompt);
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