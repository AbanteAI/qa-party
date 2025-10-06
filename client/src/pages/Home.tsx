import { Link } from 'react-router-dom';
import mentatLogo from '/mentat.png';

function Home() {
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
      <div>
        <a href="https://mentat.ai" target="_blank">
          <img src={mentatLogo} alt="Mentat Logo" />
        </a>
      </div>

      <div
        className="paper"
        style={{
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <h1>Mentat Party 🎉</h1>

        <div className="section">
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
            Welcome to Mentat Party!
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
            This is an experimental multiplayer Mentat agent. Anyone can chat
            with me and ask me to add features to this application. Try out the
            games and features below, or ask me to build something new!
          </p>
        </div>

        <div className="section">
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
            🎮 Games & Features
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <Link
              to="/snake"
              style={{
                padding: '12px 16px',
                backgroundColor: '#22c55e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                textAlign: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#16a34a')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#22c55e')
              }
            >
              🐍 Play Snake
            </Link>
          </div>
        </div>

        <div className="section">
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
            💬 Chat with Mentat
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
            Want to add a new game or feature? Just ask me in the chat! I can
            modify this application in real-time based on your requests.
          </p>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af',
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p>
            Powered by{' '}
            <a
              href="https://mentat.ai"
              target="_blank"
              style={{ color: '#3b82f6' }}
            >
              Mentat AI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
