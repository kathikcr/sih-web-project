const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const audioButton = document.querySelector("#audio-btn");

let userText = null;
let currentUtterance = null;

const API_KEY = "AIzaSyB7B-Ftgk7lSzDXUzZq4Jhj77VBiFbdlIg"; // Replace with your actual API key

const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.querySelector('.sidebar');
const body = document.body;

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  body.classList.toggle('sidebar-open');
});

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Finance Wizard</h1>
                            <p>Your Virtual Financial Advisor.<br> Expert Guidance with Your prompts</p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
}

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userText
                    }]
                }]
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let responseText = data.candidates[0].content.parts[0].text;
        
        // Remove asterisks from the response
        responseText = responseText.replace(/\*+/g, '');
        
        pElement.textContent = responseText;

        // Add translation buttons
        const translationDiv = document.createElement("div");
        translationDiv.className = "translation-options";
        translationDiv.innerHTML = `
            <button onclick="translateResponse(this, 'hi')">Translate to Hindi</button>
            <button onclick="translateResponse(this, 'ta')">Translate to Tamil</button>
        `;
        incomingChatDiv.querySelector(".chat-details").appendChild(translationDiv);

    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = `Error: ${error.message}. Please try again.`;
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    
    saveChatsToStorage();
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.closest('.chat-content').querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="chatbot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <div class="chat-options">
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        <span onclick="speakResponse(this)" class="material-symbols-rounded">volume_up</span>
                    </div>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);

function saveChatsToStorage() {
    const chats = chatContainer.innerHTML;
    try {
        localStorage.setItem("all-chats", chats);
    } catch (error) {
        console.error("Error saving chats to local storage:", error);
    }
}

// Speech recognition setup
let recognition;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        audioButton.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        audioButton.classList.remove('listening');
    };

    recognition.onend = () => {
        audioButton.classList.remove('listening');
    };

    audioButton.addEventListener('click', () => {
        if (audioButton.classList.contains('listening')) {
            recognition.stop();
            audioButton.classList.remove('listening');
        } else {
            recognition.start();
            audioButton.classList.add('listening');
        }
    });
} else {
    audioButton.style.display = 'none';
    console.log('Speech recognition not supported');
}

// Text-to-speech functionality
function speakResponse(speakerBtn) {
    const responseText = speakerBtn.closest('.chat-content').querySelector('p').textContent;

    // If there's an ongoing speech, stop it
    if (currentUtterance) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
        speakerBtn.textContent = 'volume_up';
        return;
    }

    const utterance = new SpeechSynthesisUtterance(responseText);
    currentUtterance = utterance;
    
    utterance.onstart = () => {
        speakerBtn.textContent = 'volume_off';
    };
    
    utterance.onend = () => {
        speakerBtn.textContent = 'volume_up';
        currentUtterance = null;
    };

    utterance.onerror = () => {
        speakerBtn.textContent = 'volume_up';
        currentUtterance = null;
    };
    
    // Speak the new text
    window.speechSynthesis.speak(utterance);
}

// Translation functionality
async function translateResponse(button, targetLang) {
    const chatDetails = button.closest('.chat-details');
    const originalText = chatDetails.querySelector('p').textContent;

    try {
        const response = await fetch('http://localhost:5000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: originalText,
                target_lang: targetLang
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translatedText;

        // Create a new paragraph for the translated text
        const translatedParagraph = document.createElement('p');
        translatedParagraph.textContent = translatedText;
        translatedParagraph.className = 'translated-text';

        // Replace the original paragraph with the translated text
        chatDetails.querySelector('p').replaceWith(translatedParagraph);

        // Remove translation options button
        chatDetails.querySelector('.translation-options').remove();

        // Add a button to show original text
        const showOriginalButton = document.createElement('button');
        showOriginalButton.textContent = 'Show Original';
        showOriginalButton.onclick = () => {
            chatDetails.querySelector('.translated-text').replaceWith(chatDetails.querySelector('.translation-options'));
        };
        chatDetails.appendChild(showOriginalButton);

    } catch (error) {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again.');
    }
}

loadDataFromLocalstorage();