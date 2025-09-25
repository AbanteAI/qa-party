import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

export const app = express();
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');
export const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Message interface
interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

// Ensure data directory exists
const dataDir = path.dirname(MESSAGES_FILE);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize messages file if it doesn't exist
if (!existsSync(MESSAGES_FILE)) {
  writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

// Helper functions for message storage
const getMessages = (): ChatMessage[] => {
  try {
    const data = readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
};

const saveMessages = (messages: ChatMessage[]): void => {
  try {
    writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving messages:', error);
    throw error; // Re-throw to let caller handle the error
  }
};

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// Chat API routes
app.get('/api/messages', (req: Request, res: Response) => {
  console.log('GET /api/messages - Fetching messages');
  const messages = getMessages();
  console.log(`GET /api/messages - Returning ${messages.length} messages`);
  res.json(messages);
});

app.post('/api/messages', (req: Request, res: Response) => {
  console.log('POST /api/messages - Received request');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  const { username, message } = req.body;

  if (!username || !message) {
    console.log('POST /api/messages - Missing username or message');
    return res.status(400).json({ error: 'Username and message are required' });
  }

  const newMessage: ChatMessage = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    username: username.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  console.log('POST /api/messages - Created new message:', newMessage);

  const messages = getMessages();
  console.log(`POST /api/messages - Current message count: ${messages.length}`);
  messages.push(newMessage);

  // Keep only the last 100 messages to prevent file from growing too large
  if (messages.length > 100) {
    messages.splice(0, messages.length - 100);
  }

  console.log(
    `POST /api/messages - Message count after adding: ${messages.length}`
  );

  try {
    console.log('POST /api/messages - Attempting to save messages to file');
    saveMessages(messages);
    console.log(
      'POST /api/messages - Message saved successfully:',
      newMessage.id
    );
    console.log('POST /api/messages - Sending response');
    res.json(newMessage);
  } catch (error) {
    console.error('POST /api/messages - Failed to persist message:', error);
    res.status(500).json({ error: 'Failed to persist message' });
  }
});

// Basic route for testing
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Mentat Party Chatroom API!' });
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
