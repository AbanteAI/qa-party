import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';

export const app = express();
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');

// In-memory store for tweets (resets on server restart)
type Tweet = {
  id: string;
  text: string;
  likes: number;
  createdAt: number;
};
const tweets: Tweet[] = [];

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// API: list tweets (newest first)
app.get('/api/tweets', (_req: Request, res: Response) => {
  const sorted = [...tweets].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ tweets: sorted });
});

// API: create tweet
app.post('/api/tweets', (req: Request, res: Response) => {
  const text: unknown = req.body?.text;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 280) {
    return res.status(400).json({ error: 'text must be 1..280 characters' });
  }
  const tweet: Tweet = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed,
    likes: 0,
    createdAt: Date.now(),
  };
  tweets.push(tweet);
  res.status(201).json({ tweet });
});

// API: like a tweet (simple increment)
app.post('/api/tweets/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const t = tweets.find((tw) => tw.id === id);
  if (!t) return res.status(404).json({ error: 'not found' });
  t.likes += 1;
  res.json({ tweet: t });
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
          <p><a href="/api/tweets">Go to Tweets API</a></p>
        </body>
      </html>
    `);
  }
});
