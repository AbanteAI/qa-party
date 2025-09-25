import { useState, useEffect } from 'react';
import mentatLogo from '/mentat.png';

function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling state
  const [log, setLog] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [latestId, setLatestId] = useState(0);

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

  // Poll every 1s for new messages
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/messages?sinceId=${latestId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: {
          messages: { id: number; text: string }[];
          latestId: number;
        } = await res.json();
        if (!cancelled && data.messages.length) {
          setLog((prev) => [
            ...prev,
            ...data.messages.map((m) => `Server: ${m.text}`),
          ]);
          setLatestId(data.latestId);
        }
      } catch {
        // ignore transient polling errors
      }
    };
    const id = setInterval(tick, 1000);
    // run once immediately
    tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [latestId]);

  const sendMessage = async () => {
    const text = input || 'Hello';
    setInput('');
    // Optimistic append
    setLog((prev) => [...prev, `You: ${text}`]);
    const res = await fetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const created: { id: number } = await res.json();
      setLatestId((prev) => Math.max(prev, created.id));
    }
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

        {/* Simple messaging via HTTP + polling */}
        <div className="section">
          <div
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '8px',
            }}
          >
            Simple Messages (1s polling)
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
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #1f2937',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
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
            {log.length === 0 ? (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                No messages yet. Type above and press Send.
              </div>
            ) : (
              log.map((line, i) => <div key={i}>• {line}</div>)
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
