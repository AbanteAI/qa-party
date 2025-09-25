import { useState, useEffect } from 'react';
import mentatLogo from '/mentat.png';

interface Bulletin {
  id: string;
  timestamp: string;
  message: string;
}

function App() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = (endpoint: string) => {
    // In development with forwarded ports, use the backend port directly
    if (window.location.hostname.includes('userdata.qa.mentat.ai')) {
      const backendUrl = window.location.origin.replace('-5173-', '-5000-');
      console.log('Frontend URL:', window.location.origin);
      console.log('Backend URL:', backendUrl);
      console.log('Full API URL:', `${backendUrl}${endpoint}`);
      return `${backendUrl}${endpoint}`;
    }
    // For local development, use the proxy
    console.log('Using proxy for:', endpoint);
    return endpoint;
  };

  const fetchBulletins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/bulletins'));
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setBulletins(data.bulletins || []);
    } catch (err) {
      console.error('Error fetching bulletins:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bulletins');
    } finally {
      setLoading(false);
    }
  };

  const submitBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/bulletins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      setNewMessage('');
      await fetchBulletins(); // Refresh the list
    } catch (err) {
      console.error('Error submitting bulletin:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit bulletin'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchBulletins();
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#f5f5f0',
        minHeight: '100vh',
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <a href="https://mentat.ai" target="_blank">
            <img
              src={mentatLogo}
              alt="Mentat Logo"
              style={{ height: '60px' }}
            />
          </a>
          <h1 style={{ margin: '10px 0', color: '#2d3748' }}>
            📋 Mentat Bulletin Board
          </h1>
          <p style={{ color: '#718096', fontSize: '16px' }}>
            Share your thoughts with the community!
          </p>
        </div>

        {/* Add Bulletin Form */}
        <div
          className="paper"
          style={{
            marginBottom: '30px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0',
          }}
        >
          <h2
            style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '18px' }}
          >
            📝 Post a New Bulletin
          </h2>
          <form onSubmit={submitBulletin}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind? Share it with everyone..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '12px',
              }}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newMessage.trim()}
              style={{
                backgroundColor: submitting ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '📤 Posting...' : '📤 Post Bulletin'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              backgroundColor: '#fed7d7',
              color: '#c53030',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #feb2b2',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Bulletins Feed */}
        <div>
          <h2
            style={{ color: '#2d3748', marginBottom: '20px', fontSize: '20px' }}
          >
            📰 Latest Bulletins
          </h2>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#718096',
                fontSize: '16px',
              }}
            >
              📡 Loading bulletins...
            </div>
          ) : bulletins.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#718096',
                fontSize: '16px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0',
              }}
            >
              📭 No bulletins yet. Be the first to post one!
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {bulletins.map((bulletin) => (
                <div
                  key={bulletin.id}
                  style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #4299e1',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#2d3748',
                      lineHeight: '1.5',
                      marginBottom: '8px',
                    }}
                  >
                    {bulletin.message}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#718096',
                      fontStyle: 'italic',
                    }}
                  >
                    🕒 {formatTimestamp(bulletin.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            color: '#718096',
            fontSize: '14px',
          }}
        >
          <p>
            Powered by{' '}
            <a
              href="https://mentat.ai"
              target="_blank"
              style={{ color: '#4299e1', textDecoration: 'none' }}
            >
              Mentat AI
            </a>{' '}
            🤖
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
