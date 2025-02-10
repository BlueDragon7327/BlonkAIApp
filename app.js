// Initialize chat storage
let chats = JSON.parse(localStorage.getItem('chats') || '{}');
let currentChatId = localStorage.getItem('currentChatId');

// Elements
const textarea = document.querySelector('.input-box');
const sendButton = document.querySelector('.send-button');
const newChatButton = document.querySelector('.new-chat-btn');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatList = document.getElementById('chatList');
const messagesContainer = document.getElementById('messagesContainer');
const modelToggle = document.getElementById('modelToggle'); // New element for model toggle

// Quick actions list with multiple prompts
const quickActionsList = [
  { text: "✨ Create image", prompts: ["Generate an image of a futuristic cityscape with neon lights:", "Imagine a surreal digital painting of a cosmic nebula:", "Create a vibrant illustration of a fantasy landscape:"] },
  { text: "📋 Make a plan", prompts: ["Help me create a plan for organizing a community event:", "Outline a step-by-step plan for launching a startup:", "Draft a detailed itinerary for a weekend getaway:"] },
  { text: "📝 Summarize text", prompts: ["Please summarize the following text:", "Can you provide a brief summary of this content?", "Summarize the main points of this article:"] },
  { text: "✍️ Help me write", prompts: ["I need help writing a compelling story about overcoming obstacles:", "Assist me in composing a creative poem about nature:", "Help me draft a persuasive essay on climate change:"] },
  { text: "⚙️ More", prompts: ["Provide additional creative ideas:", "Give me some innovative suggestions on the topic:", "Offer more insights and possibilities for this concept:"] },
  { text: "🎨 Paint a picture", prompts: ["Describe a beautiful painting of a sunset over mountains:", "Imagine an artwork that blends abstract and realism:", "Visualize a detailed portrait in the style of classical art:"] },
  { text: "📚 Explain a concept", prompts: ["Explain the theory of relativity in simple terms:", "Break down the concept of blockchain technology:", "Clarify the principles of quantum mechanics for a beginner:"] },
  { text: "🧪 Science query", prompts: ["What are some interesting facts about quantum mechanics?", "Tell me about recent breakthroughs in biotechnology:", "What are the implications of recent discoveries in astrophysics?"] },
  { text: "🍽️ Cooking advice", prompts: ["Give me a unique recipe for a vegan dish:", "Suggest a creative twist on a classic pasta dish:", "Offer some cooking tips for preparing a gourmet meal at home:"] },
  { text: "🎵 Music help", prompts: ["Help me write lyrics for a catchy pop song:", "Compose a short melody for a relaxing tune:", "Suggest chord progressions for an upbeat rock song:"] }
];

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add a message to the chat
function addMessage(content, sender = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`, 'fade-in');
    messageDiv.innerText = content;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Populate the quick actions area with a random selection of actions
function populateQuickActions() {
    const quickActionsContainer = document.querySelector('.quick-actions');
    quickActionsContainer.innerHTML = '';
    let actions = quickActionsList.slice().sort(() => Math.random() - 0.5);
    actions.slice(0, 5).forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'quick-action-btn';
        btn.textContent = action.text;
        btn.addEventListener('click', () => {
            const randomPrompt = action.prompts[Math.floor(Math.random() * action.prompts.length)];
            textarea.value = randomPrompt;
            textarea.focus();
        });
        quickActionsContainer.appendChild(btn);
    });
}

// Create a new chat
function createNewChat() {
    const chatId = 'chat_' + Date.now();
    chats[chatId] = {
        messages: [
            {
                role: "system",
                content: "You are BlonkAI. An AI developed by the guy named BlueDragon"
            }
        ],
        title: 'New Chat'
    };
    switchToChat(chatId);
    const historyContainer = document.getElementById('history');
    historyContainer.classList.add('fade-in');
    setTimeout(() => {
        historyContainer.classList.remove('fade-in');
    }, 500);
    saveChats();
    updateChatList();
}

// Switch to a specific chat conversation
function switchToChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId);
    updateChatDisplay();
    updateChatList();
}

// Update the chat display
function updateChatDisplay() {
    if (!currentChatId || !chats[currentChatId]) return;

    const chat = chats[currentChatId];

    if (chat.messages.length <= 1) {
        welcomeScreen.style.display = 'flex';
        messagesContainer.style.display = 'none';
        populateQuickActions();
    } else {
        welcomeScreen.style.display = 'none';
        messagesContainer.style.display = 'block';
        messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            if (msg.role !== 'system') {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}-message`;
                messageDiv.textContent = msg.content;
                messagesContainer.appendChild(messageDiv);
            }
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Update the conversation list
function updateChatList() {
    chatList.innerHTML = '';
    Object.entries(chats).forEach(([id, chat]) => {
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.textContent = chat.title;

        const closeButton = document.createElement('button');
        closeButton.className = 'close-chat-btn';
        closeButton.textContent = '✖';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            deleteChat(id);
        };

        div.appendChild(closeButton);
        div.onclick = () => switchToChat(id);
        chatList.appendChild(div);
    });
}

// Delete a chat
function deleteChat(chatId) {
    delete chats[chatId];
    if (currentChatId === chatId) {
        currentChatId = null;
        localStorage.removeItem('currentChatId');
        welcomeScreen.style.display = 'flex';
        messagesContainer.style.display = 'none';
    }
    saveChats();
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
    updateChatList();
}

// Generate a chat title based on the first user message
async function generateChatTitle(firstSentence) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: 'system', content: 'Generate a short, descriptive title for a chat conversation based on the following input. Only return the title.' },
                    { role: 'user', content: firstSentence }
                ]
            })
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            const title = jsonResponse.choices[0]?.message?.content.trim();
            return title || firstSentence.slice(0, 30) + (firstSentence.length > 30 ? '...' : '');
        }
    } catch (error) {
        console.error('Error generating chat title:', error);
    }
    return firstSentence.slice(0, 30) + (firstSentence.length > 30 ? '...' : '');
}

// Send a message
async function sendMessage() {
    const userInput = textarea.value.trim();
    if (!userInput) return;

    if (!currentChatId) {
        createNewChat();
    }

    textarea.value = '';

    chats[currentChatId].messages.push({
        role: 'user',
        content: userInput
    });

    if (chats[currentChatId].messages.length === 2) {
        const generatedTitle = await generateChatTitle(userInput);
        chats[currentChatId].title = generatedTitle;
        updateChatList();
    }

    updateChatDisplay();
    saveChats();

    const model = modelToggle.checked ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b-versatile"; // Determine model based on toggle

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: model,
                messages: chats[currentChatId].messages
            })
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            const assistantContent = jsonResponse.choices[0]?.message?.content;

            if (assistantContent) {
                chats[currentChatId].messages.push({
                    role: 'assistant',
                    content: assistantContent
                });
                updateChatDisplay();
                saveChats();
            }
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

// Event listeners for sending messages (Enter key or button click)
textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
sendButton.addEventListener('click', sendMessage);
newChatButton.addEventListener('click', createNewChat);

// On initial load, if no chat is selected, display the welcome screen
if (!currentChatId) {
    welcomeScreen.style.display = 'flex';
    messagesContainer.style.display = 'none';
    populateQuickActions();
} else {
    updateChatDisplay();
}
updateChatList();
