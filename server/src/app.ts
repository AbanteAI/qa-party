import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';

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

// Post a new message
app.post('/messages', (req: Request, res: Response) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  const msg: Message = { id: nextId++, text, ts: Date.now() };
  messages.push(msg);
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
