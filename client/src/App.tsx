import { useState, useEffect, useRef } from 'react';
import mentatLogo from '/mentat.png';

function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const [wsLog, setWsLog] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchBackendMessage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api');

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBackendMessage();
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    // Use relative path so it works in dev (via Vite proxy) and prod
    const wsUrl = location.origin.replace(/^http/, 'ws') + '/ws';

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      setWsLog((prev) => [...prev, 'Connected to WebSocket']);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === 'welcome') {
          setWsLog((prev) => [...prev, `Server: ${data.message}`]);
        } else if (data.type === 'echo') {
          setWsLog((prev) => [...prev, `Echo: ${data.message}`]);
        } else {
          setWsLog((prev) => [...prev, `Message: ${evt.data}`]);
        }
      } catch {
        setWsLog((prev) => [...prev, `Message: ${evt.data}`]);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      setWsLog((prev) => [...prev, 'Disconnected from WebSocket']);
    };

    ws.onerror = () => {
      setWsLog((prev) => [...prev, 'WebSocket error']);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(input || 'Hello');
    setWsLog((prev) => [...prev, `You: ${input || 'Hello'}`]);
    setInput('');
  };

  return (
    <div
      style={{
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        justifyContent: 'center',
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Logo */}
      <div>
        <a href="https://mentat.ai" target="_blank">
          <img src={mentatLogo} alt="Mentat Logo" />
        </a>
      </div>

      {/* Main content */}
      <div
        className="paper"
        style={{
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <h1>Mentat Template JS</h1>

        {/* Tech stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[
            ['Frontend', 'React, Vite, Vitest'],
            ['Backend', 'Node.js, Express, Jest'],
            ['Utilities', 'TypeScript, ESLint, Prettier'],
          ].map(([title, techs]) => (
            <div
              className="section"
              style={{ textAlign: 'center' }}
              key={title}
            >
              <div
                style={{
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#1f2937',
                  marginBottom: '4px',
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{techs}</div>
            </div>
          ))}
        </div>

        {/* Server message */}
        <div className="section">
          <div
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '8px',
            }}
          >
            Message from server:
          </div>
          <div style={{ fontSize: '14px', color: '#1f2937' }}>
            {loading ? (
              'Loading message from server...'
            ) : error ? (
              <span style={{ color: '#dc2626' }}>Error: {error}</span>
            ) : message ? (
              message
            ) : (
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                No message from server
              </span>
            )}
          </div>
        </div>

        {/* WebSocket Echo Demo */}
        <div className="section">
          <div
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '8px',
            }}
          >
            WebSocket Echo
          </div>
          <div style={{ marginBottom: '8px', fontSize: '13px' }}>
            Status:{' '}
            <span style={{ color: wsConnected ? '#16a34a' : '#dc2626' }}>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: 14,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!wsConnected}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #1f2937',
                backgroundColor: wsConnected ? '#111827' : '#9ca3af',
                color: 'white',
                fontSize: 14,
                cursor: wsConnected ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
          <div
            style={{
              marginTop: '12px',
              maxHeight: 180,
              overflow: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 8,
            }}
          >
            {wsLog.length === 0 ? (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                No messages yet. Type above and press Send.
              </div>
            ) : (
              wsLog.map((line, i) => <div key={i}>• {line}</div>)
            )}
          </div>
        </div>

        {/* Call to action */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          Create a new GitHub issue and tag{' '}
          <code
            style={{
              backgroundColor: '#f8fafc',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#1f2937',
            }}
          >
            @MentatBot
          </code>{' '}
          to get started.
        </div>
      </div>
    </div>
  );
}

export default App;
