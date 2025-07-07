/**
 * Main server file for the chat application.
 * Uses Express for server setup and Socket.io for real-time communication.
 */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); // Initialize Socket.io
const path = require('path');

// Use dynamic port provided by App Engine, fallback to 8080 locally
const port = process.env.PORT || 8080;

// Configuration
const MAX_USERS = 3; // Maximum number of users allowed in the chat
let activeUsers = []; // List of active users
let userCount = {};   // Count of users with the same display name

// Message storage
let messages = []; // Array to store messages with reactions and read receipts
let messageCounter = 0; // Counter to assign unique IDs to messages

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file on the root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit the current list of active users to the newly connected user
  socket.emit('update user list', activeUsers);

  // Handle setting the username
  socket.on('set username', (username, callback) => {
    if (activeUsers.length >= MAX_USERS) {
      callback({ success: false, message: 'Chat room is full.' });
      return;
    }

    // Append a number if the username already exists
    let originalName = username;
    let count = userCount[username] || 0;
    if (count > 0) {
      username = `${username}${count}`;
    }
    userCount[originalName] = count + 1;

    socket.username = username;
    activeUsers.push(username);

    callback({ success: true, username });

    io.emit('user joined', username);
    io.emit('update user list', activeUsers);
  });

  // Handle user reconnecting after a refresh
  socket.on('user reconnect', (username) => {
    if (activeUsers.length >= MAX_USERS && !activeUsers.includes(username)) {
      socket.emit('end chat');
      return;
    }
    socket.username = username;
    if (!activeUsers.includes(username)) {
      activeUsers.push(username);
      io.emit('user joined', username);
      io.emit('update user list', activeUsers);
    }
  });

  // Handle receiving chat messages
  socket.on('chat message', (msg) => {
    // const timestamp = new Date().toLocaleString('en-US', {
    //   year: 'numeric',
    //   month: 'short',
    //   day: 'numeric',
    //   hour: 'numeric',
    //   minute: 'numeric',
    //   second: 'numeric',
    //   hour12: true,
    // });
    const timestamp = new Date().toISOString();


    // Assign a unique ID to the message
    const messageId = messageCounter++;
    const messageData = {
      id: messageId,
      user: socket.username,
      message: msg,
      time: timestamp,
      reactions: {}, // Initialize empty reactions
      userReactions: {}, // Track individual user reactions
      readBy: [], // Track users who have read the message
    };

    // Store the message
    messages.push(messageData);

    // Emit the message to all clients
    io.emit('chat message', messageData);
  });

  // Handle adding/updating/removing a reaction to a message
  socket.on('add reaction', ({ messageId, reaction }) => {
    // Find the message by ID
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      const user = socket.username;
      const previousReaction = message.userReactions[user];

      if (previousReaction === reaction) {
        // User clicked the same reaction again; remove it
        delete message.userReactions[user];
        if (message.reactions[reaction]) {
          message.reactions[reaction] -= 1;
          if (message.reactions[reaction] === 0) {
            delete message.reactions[reaction];
          }
        }
      } else {
        // If user had a previous reaction, decrement its count
        if (previousReaction) {
          if (message.reactions[previousReaction]) {
            message.reactions[previousReaction] -= 1;
            if (message.reactions[previousReaction] === 0) {
              delete message.reactions[previousReaction];
            }
          }
        }

        if (reaction) {
          // Add or update the new reaction
          message.userReactions[user] = reaction;
          if (!message.reactions[reaction]) {
            message.reactions[reaction] = 0;
          }
          message.reactions[reaction] += 1;
        }
      }

      // Emit the updated reactions to all clients
      io.emit('update reactions', {
        messageId,
        reactions: message.reactions,
      });
    }
  });

  // Handle read receipts
  socket.on('read message', (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message && !message.readBy.includes(socket.username) && message.user !== socket.username) {
      message.readBy.push(socket.username);

      // Emit the updated read receipts to all clients
      io.emit('update read receipts', {
        messageId,
        readBy: message.readBy,
      });
    }
  });

  // Typing indicator events
  socket.on('typing', () => {
    socket.broadcast.emit('display typing', socket.username);
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('remove typing', socket.username);
  });

  // Handle 'Leave Chat' event
  socket.on('leave chat', () => {
    if (socket.username) {
      activeUsers = activeUsers.filter((user) => user !== socket.username);
      io.emit('user left', socket.username);
      io.emit('update user list', activeUsers);
      socket.disconnect();
    }
  });

  // Handle 'End Chat' event
  socket.on('end chat', () => {
    io.emit('end chat');
    activeUsers = [];
    userCount = {};
    messages = [];
    messageCounter = 0;
    io.emit('update user list', activeUsers);
    io.sockets.sockets.forEach((s) => s.disconnect(true));
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (socket.username) {
      activeUsers = activeUsers.filter((user) => user !== socket.username);
      userCount[socket.username] -= 1;
      io.emit('user left', socket.username);
      io.emit('update user list', activeUsers);
    }
  });
});

// Start the server on the dynamic port provided by App Engine
http.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});