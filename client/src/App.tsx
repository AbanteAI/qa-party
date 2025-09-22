import { useState, useEffect, useRef } from 'react';
import mentatLogo from '/mentat.png';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from server
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message to server
  const sendMessage = async () => {
    if (!currentMessage.trim() || !username.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          text: currentMessage.trim(),
        }),
      });

      if (response.ok) {
        setCurrentMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle username submission
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
      fetchMessages(); // Initial fetch
    }
  };

  // Handle message submission
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!isUsernameSet) return;

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isUsernameSet]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isUsernameSet) {
    return (
      <div
        style={{
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          justifyContent: 'center',
          padding: '20px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div>
          <a href="https://mentat.ai" target="_blank">
            <img src={mentatLogo} alt="Mentat Logo" />
          </a>
        </div>

        <div className="paper" style={{ maxWidth: '400px' }}>
          <h1>Mentat Party Agent 🥳</h1>
          <p
            style={{
              textAlign: 'center',
              marginBottom: '24px',
              color: '#6b7280',
            }}
          >
            Welcome to the chat room! Enter your username to get started.
          </p>

          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '16px',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!username.trim()}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: username.trim() ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: username.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <img src={mentatLogo} alt="Mentat Logo" style={{ height: '32px' }} />
        <h1 style={{ margin: 0, fontSize: '20px' }}>Mentat Party Agent 🥳</h1>
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
          Logged in as: <strong>{username}</strong>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              fontStyle: 'italic',
              marginTop: '50px',
            }}
          >
            No messages yet. Be the first to say hello! 👋
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor:
                  msg.username === username ? '#dbeafe' : 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                maxWidth: '70%',
                alignSelf:
                  msg.username === username ? 'flex-end' : 'flex-start',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: '500' }}>{msg.username}</span>
                <span>{formatTime(msg.timestamp)}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#1f2937' }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <form
          onSubmit={handleMessageSubmit}
          style={{ display: 'flex', gap: '12px' }}
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || loading}
            style={{
              padding: '12px 24px',
              backgroundColor:
                currentMessage.trim() && !loading ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor:
                currentMessage.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
