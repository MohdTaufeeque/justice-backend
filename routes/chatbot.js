document.addEventListener("DOMContentLoaded", function () {
    const chatbot = document.getElementById("chatbot-container");
    const chatbotBtn = document.getElementById("chatbot-button");
    const closeBtn = document.getElementById("close-chatbot");
    const chatInput = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("send-btn");
    const chatContent = document.getElementById("chat-content");
    
    let chatData = null; // Store the JSON data here
    let isWaitingForResponse = false;

    // Fetch the JSON data on page load
    async function fetchChatData() {
        try {
            const response = await fetch('chatbot_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            chatData = await response.json();
            console.log("Chat data loaded:", chatData);
        } catch (error) {
            console.error("Error fetching chat data:", error);
            addMessage("⚠️ Sorry, I'm having trouble loading my knowledge base. Please try again later.", "bot");
        }
    }

    // Call the function to load data
    fetchChatData();

    function toggleChatbot() {
        chatbot.classList.toggle("active");
        if (chatbot.classList.contains("active")) {
            chatInput.focus();
        }
    }

    function isHindiText(text) {
        return /[\u0900-\u097F]/.test(text) || 
               ["namaste", "namaskar", "hindi", "हिंदी"].some(word => 
               text.toLowerCase().includes(word));
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isWaitingForResponse) return;

        addMessage(message, "user");
        chatInput.value = "";
        isWaitingForResponse = true;
        chatInput.disabled = true;
        sendBtn.disabled = true;

        showTypingIndicator();

        // Find a response in the loaded JSON data
        let botResponse = "❌ Sorry, I couldn't find relevant information.";
        const isHindi = isHindiText(message);

        if (chatData) {
            // Check for an exact match or a partial match
            const query = message.toLowerCase();
            const matchingItem = chatData.find(item => {
                const keywords = item.keywords.map(kw => kw.toLowerCase());
                return keywords.some(kw => query.includes(kw));
            });

            if (matchingItem) {
                botResponse = isHindi ? matchingItem.response_hi : matchingItem.response_en;
            } else {
                botResponse = isHindi ? 
                    "❌ क्षमा करें, मैं प्रासंगिक जानकारी नहीं ढूंढ पाया।" :
                    "❌ Sorry, I couldn't find relevant information.";
            }
        }
        
        // Simulate a delay for the bot response
        setTimeout(() => {
            hideTypingIndicator();
            addMessage(botResponse, "bot");
            isWaitingForResponse = false;
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }, 1000); // 1-second delay
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message`;
        
        // Preserve line breaks and make links clickable
        const htmlText = text
            .replace(/\n/g, '<br>')
            .replace(/<a href/g, '<a class="chat-link" href');
        
        msgDiv.innerHTML = htmlText;
        chatContent.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "typing-indicator";
        typingDiv.id = "typing-indicator";
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatContent.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typing = document.getElementById("typing-indicator");
        if (typing) typing.remove();
    }

    function scrollToBottom() {
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // Event listeners
    chatbotBtn.addEventListener("click", toggleChatbot);
    closeBtn.addEventListener("click", toggleChatbot);
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
