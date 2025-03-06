let recognition;
let userMessage = null;
const chatContainer = document.querySelector(".chat-container");
const micBtn = document.querySelector(".mic-btn");
let isSpeaking = false;  // Track if AI is currently speaking
let isListening = false;  // Track if AI is actively listening

// Speech Recognition Configuration
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
} else {
    alert("Speech Recognition API is not supported in your browser.");
}

// Function to Read AI Response Aloud (Shorter responses, human-like)
function speakText(text) {
    if (isSpeaking) return;  // Prevent speaking again while AI is already speaking

    isSpeaking = true;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1;
    speech.rate = 1.1;  // Slightly faster to sound more natural
    speech.volume = 1;
    window.speechSynthesis.speak(speech);

    speech.onend = () => {
        isSpeaking = false;  // Reset after AI finishes speaking
    };
}

// Function to Show AI "Talking" Status with Image
function showAiTalkingStatus() {
    const aiStatusDiv = document.createElement("div");
    aiStatusDiv.classList.add("ai-status");

    // Add the image and text for AI status
    aiStatusDiv.innerHTML = `
        <img src="ai-talking.svg" alt="AI Talking">
        <span>AI is talking...</span>
    `;

    chatContainer.appendChild(aiStatusDiv);
    scrollToBottom();
}

// Function to Auto-scroll to Bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to Fetch AI Response (Short and direct)
async function fetchAiResponse() {
    try {
        showAiTalkingStatus();  // Show "AI is talking..." message

        // Ensure API request body is correct
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBTtxQ_fJlfKavORiH56DuO4x8C9WOovP8', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            })
        });

        // Check if response is successful
        if (!response.ok) {
            throw new Error('AI service error');
        }

        const data = await response.json();

        // Parse response text (shorter and human-like)
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI couldn't respond.";

        // Speak AI response (short and direct)
        speakText(apiResponse);
    } catch (error) {
        console.error("Error:", error);
        speakText("An error occurred. Try again.");
    }
}

// Handle Microphone Button Click (Always active)
micBtn.innerText = "🎤 Listening..."; // Show 'listening' on the button permanently
recognition.start();  // Start listening immediately

// Handle Speech Recognition Results
recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.trim();
    userMessage = transcript;

    if (userMessage) {
        isListening = false;  // Stop listening when user finishes speaking
        fetchAiResponse();  // Fetch AI response after user speaks
    }
});

// Start listening again after user stops speaking
recognition.addEventListener("end", () => {
    if (isListening) {
        recognition.start();  // Continue listening after user finishes speaking
    }
});

// Handle Speech Recognition Errors
recognition.addEventListener("error", (event) => {
    console.error("Speech Recognition Error:", event.error);
    alert("Speech recognition failed. Please try again.");
});

// Start listening when the user starts speaking and stop when they stop speaking
recognition.addEventListener("start", () => {
    isListening = true;  // Start listening
});
