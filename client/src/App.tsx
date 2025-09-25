import { useState, useEffect, useRef } from 'react';
import mentatLogo from '/mentat.png';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === 'function'
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
      setError(null); // Clear any previous errors on successful fetch
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Send message called', { username, currentMessage });

    if (!username.trim() || !currentMessage.trim()) {
      console.log('Message blocked: empty username or message');
      return;
    }

    console.log('Sending message...');
    setLoading(true);
    setError(null);

    try {
      const requestUrl = '/api/messages';
      const requestBody = {
        username: username.trim(),
        message: currentMessage.trim(),
      };

      console.log('Making POST request to:', requestUrl);
      console.log('Request body:', requestBody);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      console.log('Response URL was:', response.url);

      setCurrentMessage('');
      await fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchMessages();

    // Auto-refresh messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chatroom">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <a href="https://mentat.ai" target="_blank" rel="noopener noreferrer">
            <img src={mentatLogo} alt="Mentat Logo" width="32" height="32" />
          </a>
        </div>
        <h1>🎉 Mentat Party Chatroom</h1>
        <div className="status">{messages.length} messages • Live</div>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome to the Mentat Party! 🎊</p>
            <p>This is an oldschool chatroom powered by Mentat AI.</p>
            <p>Enter your username below and start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message">
              <span className="timestamp">[{formatTime(msg.timestamp)}]</span>
              <span className="username">&lt;{msg.username}&gt;</span>
              <span className="text">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={sendMessage} className="input-form">
        <div className="input-row">
          <input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            maxLength={20}
          />
          <input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="message-input"
            maxLength={500}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !username.trim() || !currentMessage.trim()}
            className="send-button"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default App;
