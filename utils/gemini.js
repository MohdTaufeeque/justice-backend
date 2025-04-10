const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro-latest",
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
    if (!prompt.trim()) return "Please ask a valid question.";

    // Detect language preference
    const isHindiRequest = prompt.toLowerCase().includes("hindi") || 
                         /(हिंदी|हिन्दी)/i.test(prompt);
    
    const modifiedPrompt = isHindiRequest 
      ? `${prompt}. कृपया हिंदी में उत्तर दें।`
      : prompt;

    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    
    if (!response?.text()) throw new Error("Empty response");
    return response.text();

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Technical issue. Please try again later.";
  }
}

module.exports = { askGemini };