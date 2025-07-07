// public/client.js

/**
 * Client-side JavaScript for handling user interactions and Socket.io events.
 */

const socket = io(); // Initialize Socket.io client
let username = '';
let userList = []; // List of online users

// Notification Settings
let audioNotificationsEnabled = false;
let audio = new Audio('notification.mp3'); // Ensure you have this file in the public directory

// Tab Notification Variables
let originalTitle = document.title;
let blinkInterval = null;
const faviconDefault = '/favicon.png'; // Path to your default favicon
const faviconAlert = '/favicon-alert.png'; // Path to your alert favicon

// Initialize chat if username is stored
function initChat() {
  username = localStorage.getItem('username');
  if (username) {
    document.getElementById('displayName').innerText = username;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('chatPage').style.display = 'flex';
    socket.emit('user reconnect', username);
    // Focus the message input box
    document.getElementById('messageInput').focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChat();
});

// Handle 'Enter' key press on the username input
document.getElementById('usernameInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('joinChat').click();
  }
});

// Join chat handler
document.getElementById('joinChat').addEventListener('click', () => {
  const inputName = document.getElementById('usernameInput').value.trim();
  if (inputName) {
    socket.emit('set username', inputName, (response) => {
      if (response.success) {
        username = response.username;
        localStorage.setItem('username', username);
        document.getElementById('displayName').innerText = username;
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('chatPage').style.display = 'flex';
        // Focus the message input box
        document.getElementById('messageInput').focus();
      } else {
        alert(response.message);
      }
    });
  }
});

// Typing indicator variables
let typing = false;
let typingTimeout;

// Function to reset typing indicator
function timeoutFunction() {
  typing = false;
  socket.emit('stop typing');
}

// Handle typing events
document.getElementById('messageInput').addEventListener('input', () => {
  if (!typing) {
    typing = true;
    socket.emit('typing');
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(timeoutFunction, 2000);
});

// Handle message form submission and 'Enter' key
document.getElementById('messageForm').addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Function to send a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', message);
    messageInput.value = '';
    socket.emit('stop typing');
    typing = false;
    // Focus back to message input box
    messageInput.focus();
  }
}

// Handle incoming messages
socket.on('chat message', (data) => {
  const chatBox = document.getElementById('chatBox');

  // Create message container
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.setAttribute('data-message-id', data.id); // Assign message ID

  let textElement; // Declare textElement with let outside the if-else blocks

  // Determine if the message is sent or received
  if (data.user === username) {
    // Sent message (current user)
    messageElement.classList.add('sent');

    // Create text (bubble) element for sent message
    textElement = document.createElement('div');
    textElement.classList.add('text');

    // Time stamp (shown for sent message)
    const timeElement = document.createElement('div');
    timeElement.classList.add('time-stamp');
    // timeElement.innerText = `[${data.time}]`;
    const localTime = new Date(data.time).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
    timeElement.innerText = `[${localTime}]`;
    

    // Message content (for sent message)
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = parseMessage(data.message); // You can modify message format here if needed

    // Append time and message content for sent message
    textElement.appendChild(timeElement);
    textElement.appendChild(messageContent);

    // Append text element to message container (sent)
    messageElement.appendChild(textElement);

    // **Display Reactions for Sent Messages**
    // Create a container for reactions beneath the bubble
    const reactionsContainer = document.createElement('div');
    reactionsContainer.classList.add('reactions-container-sent');

    // Append reactions container to the message
    messageElement.appendChild(reactionsContainer);

    // Render existing reactions if any
    if (data.reactions && Object.keys(data.reactions).length > 0) {
      renderReactions(reactionsContainer, data.reactions);
    }

    // **Add Read Receipts for Sent Messages**
    let readReceiptsElement = document.createElement('div');
    readReceiptsElement.classList.add('read-receipts');
    messageElement.appendChild(readReceiptsElement);
  } else {
    // Received message (other users)
    messageElement.classList.add('received');

    // Create text (bubble) element for received message
    textElement = document.createElement('div');
    textElement.classList.add('text');

    // Time stamp (shown for received message)
    const timeElement = document.createElement('div');
    timeElement.classList.add('time-stamp');
    // timeElement.innerText = `[${data.time}]`;
    const localTime = new Date(data.time).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    timeElement.innerText = `[${localTime}]`;

    // Username and message in the same line (for received message)
    const userMessage = document.createElement('div');
    userMessage.classList.add('user-message');

    // Username (bold)
    const userElement = document.createElement('span');
    userElement.classList.add('username');
    userElement.innerHTML = `<strong>${data.user}</strong>: `; // No line break, username and message on the same line

    // Message content
    const messageContent = document.createElement('span');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = parseMessage(data.message); // You can modify message format here if needed

    // Append username and message content for received message
    userMessage.appendChild(userElement);
    userMessage.appendChild(messageContent);

    // Append time and user-message for received message
    textElement.appendChild(timeElement);
    textElement.appendChild(userMessage);

    // Append text element to message container (received)
    messageElement.appendChild(textElement);

    // **Add Reaction Button for Received Messages**
    // Create a container for reactions beneath the bubble
    const reactionsContainer = document.createElement('div');
    reactionsContainer.classList.add('reactions-container-received');

    // Add Reaction Button
    const reactionButton = document.createElement('button');
    reactionButton.classList.add('reaction-button');
    reactionButton.innerText = '😊'; // Default reaction emoji
    reactionButton.title = 'Add a reaction';

    // Append reaction button to the text element (right side)
    textElement.appendChild(reactionButton);

    // Append reactions container to the message
    messageElement.appendChild(reactionsContainer);

    // Event listener for reaction button
    reactionButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering other click events
      showReactionPicker(reactionButton, data.id);
    });

    // Render existing reactions if any
    if (data.reactions && Object.keys(data.reactions).length > 0) {
      renderReactions(reactionsContainer, data.reactions);
    }

    // Observe the message for read receipts
    observer.observe(messageElement);
  }

  // Append message to chat box
  chatBox.appendChild(messageElement);

  // Scroll to latest message
  messageElement.scrollIntoView({ behavior: 'smooth' });

  // Play audio notification if enabled and message is received
  if (audioNotificationsEnabled && data.user !== username) {
    audio.play();
  }

  // Handle Tab Title and Favicon Notifications
  if (document.hidden && data.user !== username) {
    startTabNotification();
  }
});

// Function to parse message content for links and formatting
function parseMessage(message) {
  // Convert links starting with http:// or https:// into clickable links
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  message = message.replace(urlPattern, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  });

  // Simple message formatting
  // Bold: **text**
  message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code block: `code`
  message = message.replace(/`(.*?)`/g, '<code>$1</code>');

  // Return the formatted message
  return message;
}

// Handle typing indicator
socket.on('display typing', (user) => {
  if (user !== username) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.innerText = `${user} is typing...`;
  }
});

socket.on('remove typing', () => {
  const typingIndicator = document.getElementById('typingIndicator');
  typingIndicator.innerText = '';
});

// Popup Dialogs for Leave Chat and End Chat

// Function to show custom modal
function showModal(message, confirmCallback) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const confirmButton = document.getElementById('modalConfirm');
  const cancelButton = document.getElementById('modalCancel');

  modalMessage.innerText = message;
  modal.style.display = 'flex';

  // Remove existing event listeners
  confirmButton.replaceWith(confirmButton.cloneNode(true));
  cancelButton.replaceWith(cancelButton.cloneNode(true));

  // Update references after cloning
  const newConfirmButton = document.getElementById('modalConfirm');
  const newCancelButton = document.getElementById('modalCancel');

  newConfirmButton.addEventListener('click', () => {
    confirmCallback();
    modal.style.display = 'none';
  });

  newCancelButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// 'End Chat' button handler
document.getElementById('endChat').addEventListener('click', () => {
  showModal('Are you sure you want to end the chat for everyone?', () => {
    socket.emit('end chat');
  });
});

// 'Leave Chat' button handler
document.getElementById('leaveChat').addEventListener('click', () => {
  showModal('Are you sure you want to leave the chat?', () => {
    socket.emit('leave chat');
    localStorage.removeItem('username');
    window.location.reload();
  });
});

// Handle end chat event
socket.on('end chat', () => {
  alert('Chat has been ended by a user.');
  localStorage.removeItem('username');
  window.location.reload();
});

// Handle user join/leave notifications
socket.on('user joined', (user) => {
  if (user) {
    const chatBox = document.getElementById('chatBox');
    const infoElement = document.createElement('div');
    infoElement.classList.add('info');
    infoElement.innerText = `${user} has joined the chat.`;
    chatBox.appendChild(infoElement);
    infoElement.scrollIntoView({ behavior: 'smooth' });
  }
});

socket.on('user left', (user) => {
  if (user) {
    const chatBox = document.getElementById('chatBox');
    const existingNotifications = chatBox.querySelectorAll('.info');
    const lastNotification = existingNotifications[existingNotifications.length - 1];

    // Check if the last notification is the same to prevent duplicates
    if (!lastNotification || lastNotification.innerText !== `${user} has left the chat.`) {
      const infoElement = document.createElement('div');
      infoElement.classList.add('info');
      infoElement.innerText = `${user} has left the chat.`;
      chatBox.appendChild(infoElement);
      infoElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Handle updating the online users list
socket.on('update user list', (users) => {
  userList = users;
  renderUserList();
});

// Function to render the list of online users
function renderUserList() {
  const userListContainer = document.getElementById('userList');
  userListContainer.innerHTML = ''; // Clear existing list

  userList.forEach((user) => {
    const userElement = document.createElement('div');
    userElement.classList.add('user-item');
    userElement.innerText = user;
    userListContainer.appendChild(userElement);
  });
}

// Handle emoji picker
const emojiButton = document.getElementById('emojiButton');
const emojiPopup = document.getElementById('emoji-popup');

// Show/hide emoji picker when emoji button is clicked
emojiButton.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent event bubbling
  emojiPopup.classList.toggle('show');
});

// Insert emoji into message input when an emoji is clicked
emojiPopup.addEventListener('click', (e) => {
  if (e.target.tagName === 'TD') {
    const emoji = e.target.innerText;
    const messageInput = document.getElementById('messageInput');
    // Insert emoji at cursor position
    insertAtCursor(messageInput, emoji);
    // Hide the emoji picker
    emojiPopup.classList.remove('show');
    // Focus back to message input
    messageInput.focus();
  }
});

// Function to insert text at cursor position in input/textarea
function insertAtCursor(input, textToInsert) {
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  const beforeValue = input.value.substring(0, startPos);
  const afterValue = input.value.substring(endPos, input.value.length);
  input.value = beforeValue + textToInsert + afterValue;
  input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
}

// Close emoji picker if clicked outside
document.addEventListener('click', (e) => {
  if (!emojiPopup.contains(e.target) && e.target !== emojiButton) {
    emojiPopup.classList.remove('show');
  }
});

// Reaction Picker
function showReactionPicker(button, messageId) {
  // Prevent multiple pickers
  closeAllReactionPickers();

  // Create reaction picker container
  const picker = document.createElement('div');
  picker.classList.add('reaction-picker');

  // Define available reactions
  const availableReactions = ['👍', '❤️', '😂', '😲', '😢', '👎'];

  // Create reaction buttons
  availableReactions.forEach((reaction) => {
    const reactionBtn = document.createElement('span');
    reactionBtn.classList.add('reaction-option');
    reactionBtn.innerText = reaction;
    reactionBtn.title = `React with ${reaction}`;
    reactionBtn.addEventListener('click', () => {
      socket.emit('add reaction', { messageId, reaction });
      picker.remove();
    });
    picker.appendChild(reactionBtn);
  });

  // Append picker to the body
  document.body.appendChild(picker);

  // Position the picker relative to the reaction button
  const buttonRect = button.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();

  let top = buttonRect.top - pickerRect.height - 10; // Position above the button
  let left = buttonRect.left + (buttonRect.width / 2) - (pickerRect.width / 2);

  // Ensure the picker stays within the viewport
  if (left < 0) left = 0;
  if (top < 0) top = buttonRect.bottom + 10; // Place below the button if not enough space above

  picker.style.position = 'absolute';
  picker.style.top = `${top}px`;
  picker.style.left = `${left}px`;
  picker.style.zIndex = '1000';

  // Close picker when clicking outside
  document.addEventListener('click', handleClickOutside);

  function handleClickOutside(event) {
    if (!picker.contains(event.target) && event.target !== button) {
      picker.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  }
}

// Function to close all open reaction pickers
function closeAllReactionPickers() {
  const pickers = document.querySelectorAll('.reaction-picker');
  pickers.forEach((picker) => picker.remove());
}

// Handle updating reactions
socket.on('update reactions', ({ messageId, reactions }) => {
  const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
  if (messageElement) {
    let reactionsContainer;
    if (messageElement.classList.contains('sent')) {
      reactionsContainer = messageElement.querySelector('.reactions-container-sent');
    } else {
      reactionsContainer = messageElement.querySelector('.reactions-container-received');
    }
    if (reactionsContainer) {
      renderReactions(reactionsContainer, reactions);
    }
  }
});

// Function to render reactions for a message
function renderReactions(container, reactions) {
  container.innerHTML = ''; // Clear existing reactions

  for (const [reaction, users] of Object.entries(reactions)) {
    let count = 0;
    if (Array.isArray(users)) {
      count = users.length;
    } else if (typeof users === 'number') {
      count = users;
    } else {
      count = 1; // Fallback if users is not an array or number
    }

    const reactionElement = document.createElement('span');
    reactionElement.classList.add('reaction');
    reactionElement.innerText = `${reaction} ${count}`;
    container.appendChild(reactionElement);
  }
}

// Handle read receipts
socket.on('update read receipts', ({ messageId, readBy }) => {
  const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
  if (messageElement) {
    if (messageElement.classList.contains('sent')) {
      let readReceiptsElement = messageElement.querySelector('.read-receipts');
      if (!readReceiptsElement) {
        readReceiptsElement = document.createElement('div');
        readReceiptsElement.classList.add('read-receipts');
        messageElement.appendChild(readReceiptsElement);
      }

      // Exclude the sender from the readBy list
      const otherReaders = readBy.filter(user => user !== username);
      if (otherReaders.length > 0) {
        readReceiptsElement.innerText = `Read by: ${otherReaders.join(', ')}`;
      } else {
        readReceiptsElement.innerText = '';
      }
    }
  }
});

// Detect when a message is in view and emit 'read message' event
const observerOptions = {
  root: document.getElementById('chatBox'),
  rootMargin: '0px',
  threshold: 0.5, // 50% of the message is visible
};

const observer = new IntersectionObserver(handleIntersect, observerOptions);

function handleIntersect(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const messageId = entry.target.getAttribute('data-message-id');
      const messageUser = entry.target.classList.contains('sent') ? username : null;
      if (messageUser !== username) { // Only send read receipt for received messages
        socket.emit('read message', parseInt(messageId));
      }
      observer.unobserve(entry.target); // Stop observing after reading
    }
  });
}

// Audio Notifications Toggle
document.getElementById('notificationToggle').addEventListener('click', () => {
  audioNotificationsEnabled = !audioNotificationsEnabled;
  localStorage.setItem('audioNotificationsEnabled', audioNotificationsEnabled.toString());
  const notificationToggle = document.getElementById('notificationToggle');

  if (audioNotificationsEnabled) {
    notificationToggle.innerText = 'Disable Audio Notifications';
    notificationToggle.classList.add('enabled');
    // Optionally, play a confirmation sound
    audio.play();
  } else {
    notificationToggle.innerText = 'Enable Audio Notifications';
    notificationToggle.classList.remove('enabled');
  }
});

// Load notification settings on startup
window.addEventListener('load', () => {
  const storedSetting = localStorage.getItem('audioNotificationsEnabled');
  const notificationToggle = document.getElementById('notificationToggle');
  if (storedSetting === 'true') {
    audioNotificationsEnabled = true;
    notificationToggle.innerText = 'Disable Audio Notifications';
    notificationToggle.classList.add('enabled');
  } else {
    audioNotificationsEnabled = false;
    notificationToggle.innerText = 'Enable Audio Notifications';
    notificationToggle.classList.remove('enabled');
  }
});

// Tab Title and Favicon Notifications
function startTabNotification() {
  if (!blinkInterval) {
    blinkInterval = setInterval(() => {
      document.title = document.title === 'New Message!' ? originalTitle : 'New Message!';
      toggleFavicon();
    }, 1000);
  }
}

function stopTabNotification() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
    document.title = originalTitle;
    updateFavicon(faviconDefault);
  }
}

function toggleFavicon() {
  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = favicon.href.includes('favicon-alert.png') ? faviconDefault : faviconAlert;
  }
}

function updateFavicon(src) {
  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = src;
  }
}

// Listen for visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    stopTabNotification();
  }
});
