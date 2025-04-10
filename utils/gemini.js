const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    maxOutputTokens: 2000,
    temperature: 0.9,
    topP: 1,
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ]
});

async function askGemini(prompt) {
  try {
    if (!prompt || prompt.trim() === '') {
      return "Please ask a valid question.";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const response = await result.response;
    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }
    
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "⚠️ I'm experiencing technical difficulties. Please try again later.";
  }
}

module.exports = { askGemini };