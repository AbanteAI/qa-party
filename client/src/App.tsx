import { useEffect, useMemo, useState } from 'react';
import mentatLogo from '/mentat.png';

type Tweet = {
  id: string;
  text: string;
  likes: number;
  createdAt: number;
};

function App() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = useMemo(() => 280 - text.length, [text]);
  const canPost = text.trim().length > 0 && text.trim().length <= 280;

  const fetchTweets = async () => {
    try {
      const res = await fetch('/api/tweets');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTweets(data.tweets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTweets();
  }, []);

  const submitTweet = async () => {
    if (!canPost) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { tweet } = await res.json();
      setText('');
      // Prepend newly created tweet optimistically
      setTweets((prev) => [tweet, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post tweet');
    } finally {
      setPosting(false);
    }
  };

  const likeTweet = async (id: string) => {
    try {
      const res = await fetch(`/api/tweets/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { tweet } = await res.json();
      setTweets((prev) => prev.map((t) => (t.id === id ? tweet : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to like tweet');
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
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          marginTop: '16px',
        }}
      >
        <h1 style={{ textAlign: 'left' }}>Mentat Micro</h1>

        {/* Compose box */}
        <div
          className="section"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            placeholder="What is happening?!"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: remaining < 0 ? '#dc2626' : '#6b7280',
              }}
            >
              {remaining} characters left
            </span>
            <button
              onClick={submitTweet}
              disabled={!canPost || posting}
              style={{
                backgroundColor: !canPost || posting ? '#9ca3af' : '#1d9bf0',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '9999px',
                cursor: !canPost || posting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="section"
            style={{ color: '#dc2626', fontSize: '14px' }}
          >
            Error: {error}
          </div>
        )}

        {/* Timeline */}
        <div
          className="section"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
            Timeline
          </div>
          {loading ? (
            <div style={{ color: '#6b7280' }}>Loading…</div>
          ) : tweets.length === 0 ? (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
              Be the first to post!
            </div>
          ) : (
            tweets.map((t) => (
              <div
                key={t.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '14px', color: '#111827' }}>
                  {t.text}
                </div>
                <div
                  style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                >
                  <button
                    onClick={() => likeTweet(t.id)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ❤️ Like
                  </button>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {t.likes} {t.likes === 1 ? 'like' : 'likes'}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginLeft: 'auto',
                    }}
                  >
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
