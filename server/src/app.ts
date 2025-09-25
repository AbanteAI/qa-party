import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { promises as fsp } from 'fs';

export const app = express();
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// Basic route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Mentat API!' });
});

/**
 * Simple in-memory message store for polling demo
 */
type Message = { id: number; text: string; ts: number };
const messages: Message[] = [];
let nextId = 1;

// Persist messages to a simple JSON file for demo purposes
const DATA_DIR = path.join(__dirname, '../../persist');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

// Load messages at startup
(async () => {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = await fsp.readFile(DATA_FILE, 'utf-8');
      const parsed: Message[] = JSON.parse(raw);
      messages.push(...parsed);
      nextId = parsed.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    } else {
      // ensure directory exists
      await fsp.mkdir(DATA_DIR, { recursive: true });
      await fsp.writeFile(
        DATA_FILE,
        JSON.stringify(messages, null, 2),
        'utf-8'
      );
    }
  } catch (e) {
    // Non-fatal: keep in-memory only if persistence fails
     
    console.warn('Failed to load persisted messages:', e);
  }
})();

async function persistMessages() {
  try {
    await fsp.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (e) {
     
    console.warn('Failed to persist messages:', e);
  }
}

// Post a new message
app.post('/messages', (req: Request, res: Response) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  const msg: Message = { id: nextId++, text, ts: Date.now() };
  messages.push(msg);
  // fire-and-forget persistence
  void persistMessages();
  res.status(201).json(msg);
});

// Poll for messages after a given id
app.get('/messages', (req: Request, res: Response) => {
  const sinceId = Number(req.query.sinceId ?? 0);
  const result = messages.filter((m) => m.id > sinceId);
  res.json({
    messages: result,
    latestId: messages.length ? messages[messages.length - 1].id : sinceId,
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
