import { Link } from 'react-router-dom';
import Snake from '../components/Snake';

function SnakePage() {
  return (
    <div
      style={{
        backgroundColor: '#fafafa',
        minHeight: '100vh',
        width: '100vw',
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>🐍 Snake Game</h1>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <div className="paper">
          <Snake />
        </div>
      </div>
    </div>
  );
}

export default SnakePage;
