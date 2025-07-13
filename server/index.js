const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store last 20 messages in memory
let messageHistory = [];
const MAX_MESSAGES = 20;

// Store connected users
let connectedUsers = new Set();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    if (!username || username.trim() === '') {
      socket.emit('error', 'Username is required');
      return;
    }

    socket.username = username.trim();
    connectedUsers.add(socket.username);
    
    // Send message history to new user
    socket.emit('messageHistory', messageHistory);
    
    // Notify others about new user
    const joinMessage = {
      id: Date.now(),
      username: 'System',
      message: `${socket.username} joined the chat`,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'system'
    };
    
    socket.broadcast.emit('message', joinMessage);
    addToHistory(joinMessage);
    
    console.log(`${socket.username} joined the chat`);
  });

  // Handle new messages
  socket.on('sendMessage', (messageData) => {

    console.log("messageData",messageData)
    if (!socket.username) {
      socket.emit('error', 'Please join with a username first');
      return;
    }

    if (!messageData.message || messageData.message.trim() === '') {
      socket.emit('error', 'Message cannot be empty');
      return;
    }

    const message = {
      id: Date.now(),
      username: socket.username,
      message: messageData.message.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'user'
    };

    // Broadcast message to all clients
    io.emit('message', message);
    addToHistory(message);
    
    console.log(`Message from ${socket.username}: ${message.message}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      connectedUsers.delete(socket.username);
      
      const leaveMessage = {
        id: Date.now(),
        username: 'System',
        message: `${socket.username} left the chat`,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'system'
      };
      
      socket.broadcast.emit('message', leaveMessage);
      addToHistory(leaveMessage);
      
      console.log(`${socket.username} disconnected`);
    }
  });
});

function addToHistory(message) {
  messageHistory.push(message);
  if (messageHistory.length > MAX_MESSAGES) {
    messageHistory.shift(); // Remove oldest message
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});