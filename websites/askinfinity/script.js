// DOM Elements
const promptInput = document.querySelector(".prompt");
const chatContainer = document.querySelector(".chat-container");
const sendBtn = document.querySelector(".btn");
const micBtn = document.querySelector(".mic-btn");
const welcomeContainer = document.getElementById("welcome-container");
let userMessage = null;

// API Configuration
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAd09_-8GWw-auFFTya4uvp-sXto8k8rqk';

// Function to Create Chat Box
function createChatBox(html, className) {
    const div = document.createElement("div");
    div.classList.add(className);
    div.innerHTML = html;
    return div;
}

// Function to Auto-scroll to Bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to Handle Creator-Specific Questions
function getCreatorSpecificResponse(question) {
    const lowerCaseQuestion = question.toLowerCase();
    if (lowerCaseQuestion.includes("who made you") || 
        lowerCaseQuestion.includes("who created you") || 
        lowerCaseQuestion.includes("who is your creator") || 
        lowerCaseQuestion.includes("who built you")) {
        return "Ojas Khatiwada was my creator.";
    }
    return null;
}


// Function to Read AI Response Aloud
function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1;
    speech.rate = 1.15;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

// Function to Fetch AI Response
async function fetchAiResponse(aiChatBox) {
    const textElement = aiChatBox.querySelector(".text");
    try {
        const creatorResponse = getCreatorSpecificResponse(userMessage);
        if (creatorResponse) {
            textElement.innerText = creatorResponse;
            speakText(creatorResponse);
            return;
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            })
        });
        const data = await response.json();
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI couldn't respond.";
        const plainTextResponse = apiResponse.replace(/[#*]/g, "");

        textElement.innerText = plainTextResponse;
        speakText(plainTextResponse);
    } catch (error) {
        console.error("Error:", error);
        textElement.innerText = "An error occurred. Try again later.";
    } finally {
        aiChatBox.querySelector(".loading").remove();
        scrollToBottom();
    }
}

// Function to Display Loading AI Response
function showLoading() {
    const html = `
        <div id="img">
            <img src="ai.png" alt="AI">
        </div>
        <div class="text"></div>
        <img src="loading.gif" alt="Loading" height="30" class="loading">`;
    const aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    scrollToBottom();
    fetchAiResponse(aiChatBox);
}

// Handle Send Button Click
sendBtn.addEventListener("click", () => {
    userMessage = promptInput.value.trim();
    if (!userMessage) {
        alert("Please enter a message!");
        return;
    }

    if (welcomeContainer) {
        welcomeContainer.style.display = "none";
    }

    const userHtml = `
        <div id="img">
            <img src="user.png" alt="User">
        </div>
        <div class="text">${userMessage}</div>`;
    const userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    promptInput.value = "";
    scrollToBottom();

    setTimeout(showLoading, 500);
});

// Handle Enter Key for Input
promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendBtn.click();
    }
});

// Speech Recognition Configuration
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
} else {
    alert("Speech Recognition API is not supported in your browser.");
}

// Handle Microphone Button Click
micBtn.addEventListener("click", () => {
    if (!recognition) {
        alert("Speech recognition is not available.");
        return;
    }
    recognition.start();
    micBtn.disabled = true;
    micBtn.innerText = "Listening...";
});

// Handle Speech Recognition Results
recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.trim();
    userMessage = transcript;

    if (welcomeContainer) {
        welcomeContainer.style.display = "none";
    }

    const userHtml = `
        <div id="img">
            <img src="user.png" alt="User">
        </div>
        <div class="text">${userMessage}</div>`;
    const userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    scrollToBottom();

    showLoading();
});

// Reset Microphone Button After Speech Recognition Ends
recognition.addEventListener("end", () => {
    micBtn.disabled = false;
    micBtn.innerText = "🎤 Speak";
});

// Handle Speech Recognition Errors
recognition.addEventListener("error", (event) => {
    console.error("Speech Recognition Error:", event.error);
    alert("Speech recognition failed. Please try again.");
    micBtn.disabled = false;
    micBtn.innerText = "🎤 Speak";
});
document.querySelector(".new-conversation-btn").addEventListener("click", function() {
    window.location.href = "speech-conversation.html"; // Redirect to the new page
});
