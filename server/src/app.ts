import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const app = express();
export const server = createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? true
        : ['http://localhost:5173', 'http://localhost:5000'],
    methods: ['GET', 'POST'],
  },
});
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');

// Chat room state
interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

const users = new Map<string, User>();
const messages: Message[] = [];
const MAX_MESSAGES = 100; // Keep last 100 messages

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// Basic route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Mentat Chat Room!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (username: string) => {
    if (!username || username.trim() === '') {
      socket.emit('chat_error', 'Username is required');
      return;
    }

    const user: User = {
      id: socket.id,
      username: username.trim(),
    };

    users.set(socket.id, user);

    // Send recent messages to the new user
    socket.emit('message_history', messages.slice(-50)); // Last 50 messages

    // Send current users list
    const usersList = Array.from(users.values());
    io.emit('users_update', usersList);

    // Notify others that user joined
    socket.broadcast.emit('user_joined', user);

    console.log(`${username} joined the chat`);
  });

  // Handle new messages
  socket.on('send_message', (text: string) => {
    const user = users.get(socket.id);
    if (!user) {
      socket.emit('chat_error', 'You must join the chat first');
      return;
    }

    if (!text || text.trim() === '') {
      socket.emit('chat_error', 'Message cannot be empty');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      username: user.username,
      text: text.trim(),
      timestamp: new Date(),
    };

    messages.push(message);

    // Keep only the last MAX_MESSAGES
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    // Broadcast message to all users
    io.emit('new_message', message);

    console.log(`${user.username}: ${text}`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);

      // Update users list
      const usersList = Array.from(users.values());
      io.emit('users_update', usersList);

      // Notify others that user left
      socket.broadcast.emit('user_left', user);

      console.log(`${user.username} left the chat`);
    }
  });
});

// Serve React app or fallback page
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(CLIENT_DIST_PATH, 'index.html');

  // Check if the built client exists
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Serve a simple fallback page when the client hasn't been built
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mentat Template JS</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>Mentat Template JS</h1>
          <p>Everything is working correctly.</p>
          <p>This route renders the built project from the <code>/dist</code> directory, but there's currently nothing there.</p>
          <p>You can ask Mentat to build the project to see the React app here, or build it yourself with <code>npm run build</code>.</p>
          <p><a href="/api">Go to API endpoint</a></p>
        </body>
      </html>
    `);
  }
});
