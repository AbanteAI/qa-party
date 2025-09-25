import { app, PORT } from './app';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

// Start HTTP server and attach WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/socket' });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('WebSocket client connected', req.socket.remoteAddress);

  ws.send(
    JSON.stringify({ type: 'welcome', message: 'Connected to echo server' })
  );

  ws.on('message', (data: WebSocket.RawData) => {
    // Echo back whatever was sent, as text
    const text = typeof data === 'string' ? data : data.toString('utf-8');
    ws.send(JSON.stringify({ type: 'echo', message: text }));
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
