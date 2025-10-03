import { useState, useEffect, useRef } from 'react';
import mentatLogo from '/mentat.png';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji -> array of usernames who reacted
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userHighScores, setUserHighScores] = useState<Record<string, number>>(
    {}
  );

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

      // Fetch high scores for unique usernames
      await fetchHighScoresForUsers(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const fetchHighScoresForUsers = async (messages: ChatMessage[]) => {
    const uniqueUsernames = [...new Set(messages.map((msg) => msg.username))];
    const newHighScores: Record<string, number> = {};

    for (const username of uniqueUsernames) {
      if (userHighScores[username] !== undefined) {
        // Already have this user's high score
        newHighScores[username] = userHighScores[username];
        continue;
      }

      try {
        // Use proxy endpoint on same server to avoid CORS issues
        const response = await fetch(
          `/api/snake-scores/${encodeURIComponent(username)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.highScore !== null) {
            newHighScores[username] = data.highScore;
          }
        }
      } catch (err) {
        // Snake game API might not be available, that's okay
        console.log(`Could not fetch high score for ${username}:`, err);
      }
    }

    setUserHighScores((prev) => ({ ...prev, ...newHighScores }));
  };

  // Helper function to determine if a user has the current highest score
  const isCurrentChampion = (username: string): boolean => {
    const userScore = userHighScores[username];
    if (!userScore) return false;

    const allScores = Object.values(userHighScores);
    const maxScore = Math.max(...allScores);

    return userScore === maxScore && userScore > 0;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Send message called', { username, currentMessage });

    if (!username.trim() || !currentMessage.trim() || !password.trim()) {
      console.log('Message blocked: empty username, message, or password');
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
        password: password.trim(),
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

  const addReaction = async (messageId: string, emoji: string) => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password required to react');
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji,
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add reaction');
      }

      // Refresh messages to show new reaction
      await fetchMessages();
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji,
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove reaction');
      }

      // Refresh messages to show updated reactions
      await fetchMessages();
    } catch (err) {
      console.error('Error removing reaction:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to remove reaction'
      );
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message || !message.reactions) {
      await addReaction(messageId, emoji);
      return;
    }

    const userReacted = message.reactions[emoji]?.includes(username.trim());
    if (userReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
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
              <span className="username">
                &lt;{msg.username}&gt;
                {userHighScores[msg.username] !== undefined && (
                  <span
                    className="high-score"
                    title={`Snake Game High Score: ${userHighScores[msg.username]}${isCurrentChampion(msg.username) ? ' - Current Champion!' : ''}`}
                  >
                    🐍{userHighScores[msg.username]}
                    {isCurrentChampion(msg.username) && (
                      <span className="champion-star">⭐</span>
                    )}
                  </span>
                )}
              </span>
              <span className="text">{msg.message}</span>

              {/* Reactions */}
              <div className="reactions-container">
                {/* Display existing reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="reactions">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        className={`reaction ${users.includes(username.trim()) ? 'user-reacted' : ''}`}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        title={`${users.join(', ')} reacted with ${emoji}`}
                      >
                        {emoji} {users.length}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick reaction buttons */}
                {username.trim() && password.trim() && (
                  <div className="quick-reactions">
                    {['👍', '❤️', '😂', '🎉', '🔥'].map((emoji) => (
                      <button
                        key={emoji}
                        className="quick-reaction"
                        onClick={() => toggleReaction(msg.id, emoji)}
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            type="password"
            placeholder="Password (set on first use)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            maxLength={50}
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
            disabled={
              loading ||
              !username.trim() ||
              !currentMessage.trim() ||
              !password.trim()
            }
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
