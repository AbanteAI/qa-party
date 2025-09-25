import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import mentatLogo from '/mentat.png';

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('message_history', (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('users_update', (usersList: User[]) => {
      setUsers(usersList);
    });

    newSocket.on('user_joined', (user: User) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: 'System',
          text: `${user.username} joined the chat`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('user_left', (user: User) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: 'System',
          text: `${user.username} left the chat`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('error', (errorMessage: string) => {
      setError(errorMessage);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('join', username.trim());
      setIsJoined(true);
      setError(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send_message', newMessage.trim());
      setNewMessage('');
      setError(null);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isJoined) {
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
            <img
              src={mentatLogo}
              alt="Mentat Logo"
              style={{ marginBottom: '20px' }}
            />
          </a>
        </div>

        <div
          className="paper"
          style={{ maxWidth: '400px', textAlign: 'center' }}
        >
          <h1 style={{ marginBottom: '20px' }}>Mentat Chat Room</h1>

          <form onSubmit={handleJoin}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>

            {error && (
              <div
                style={{
                  color: '#dc2626',
                  marginBottom: '16px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

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
        height: '100vh',
        width: '100vw',
        display: 'flex',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          <h1 style={{ fontSize: '20px', margin: 0 }}>Mentat Chat Room</h1>
          <div
            style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}
          >
            Welcome, {username}!
          </div>
        </div>

        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#f9fafb',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '16px',
                padding: message.username === 'System' ? '8px 12px' : '12px',
                backgroundColor:
                  message.username === 'System' ? '#f3f4f6' : 'white',
                borderRadius: '8px',
                border:
                  message.username === 'System' ? '1px solid #d1d5db' : 'none',
                boxShadow:
                  message.username === 'System'
                    ? 'none'
                    : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              {message.username !== 'System' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>
                    {message.username}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              <div
                style={{
                  color: message.username === 'System' ? '#6b7280' : '#1f2937',
                  fontSize: message.username === 'System' ? '13px' : '14px',
                  fontStyle:
                    message.username === 'System' ? 'italic' : 'normal',
                  textAlign: message.username === 'System' ? 'center' : 'left',
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          {error && (
            <div
              style={{
                color: '#dc2626',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}
          <form
            onSubmit={handleSendMessage}
            style={{ display: 'flex', gap: '12px' }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: newMessage.trim() ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Users sidebar */}
      <div
        style={{
          width: '250px',
          backgroundColor: 'white',
          borderLeft: '1px solid #e5e7eb',
          padding: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1f2937' }}
        >
          Online Users ({users.length})
        </h3>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                padding: '8px 12px',
                marginBottom: '4px',
                backgroundColor:
                  user.username === username ? '#dbeafe' : '#f9fafb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
              }}
            >
              {user.username}
              {user.username === username && (
                <span style={{ color: '#3b82f6', fontSize: '12px' }}>
                  {' '}
                  (you)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
