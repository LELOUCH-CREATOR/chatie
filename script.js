const socket = io();
const messageArea = document.getElementById('messageArea');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const logoutButton = document.getElementById('logoutButton');
const usernameSpan = document.getElementById('username');

// Get current user's username from session
async function getCurrentUser() {
    try {
        const response = await fetch('/current-user');
        const data = await response.json();
        if (data.username) {
            usernameSpan.textContent = data.username;
            socket.emit('user connected', data.username);
        }
    } catch (error) {
        console.error('Error getting current user:', error);
    }
}

getCurrentUser();

// Function to create message element
function createMessageElement(data, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    
    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('message-username');
    usernameSpan.textContent = type === 'sent' ? 'You' : data.username;
    
    const messageContent = document.createElement('span');
    messageContent.classList.add('message-content');
    messageContent.textContent = type === 'sent' ? data : data.message;
    
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(messageContent);
    return messageDiv;
}

// Function to add message to chat
function addMessage(data, type) {
    const messageElement = createMessageElement(data, type);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Send message when button is clicked
sendButton.addEventListener('click', sendMessage);

// Send message when Enter key is pressed
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        // Emit message to server
        socket.emit('chat message', message);
        // Add message to chat
        addMessage(message, 'sent');
        // Clear input
        messageInput.value = '';
    }
}

// Logout functionality
logoutButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST'
        });
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Socket event listeners
socket.on('chat message', (data) => {
    addMessage(data, 'received');
});

socket.on('connect', () => {
    document.querySelector('.status-text').textContent = 'Connected';
    document.querySelector('.status-dot').style.background = '#00ff80';
});

socket.on('disconnect', () => {
    document.querySelector('.status-text').textContent = 'Disconnected';
    document.querySelector('.status-dot').style.background = '#ff3333';
});
