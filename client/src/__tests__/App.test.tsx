import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock Socket.io
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  close: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('Chat Room App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username entry screen initially', () => {
    render(<App />);

    expect(screen.getByText('Mentat Chat Room')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your username')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Join Chat' })
    ).toBeInTheDocument();
  });

  it('disables join button when username is empty', () => {
    render(<App />);

    const joinButton = screen.getByRole('button', { name: 'Join Chat' });
    expect(joinButton).toBeDisabled();
  });

  it('enables join button when username is entered', async () => {
    const user = userEvent.setup();
    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const joinButton = screen.getByRole('button', { name: 'Join Chat' });

    await user.type(usernameInput, 'testuser');
    expect(joinButton).toBeEnabled();
  });

  it('emits join event when form is submitted', async () => {
    const user = userEvent.setup();
    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const joinButton = screen.getByRole('button', { name: 'Join Chat' });

    await user.type(usernameInput, 'testuser');
    await user.click(joinButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('join', 'testuser');
  });

  it('sets up socket event listeners on mount', () => {
    render(<App />);

    expect(mockSocket.on).toHaveBeenCalledWith(
      'message_history',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'new_message',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'users_update',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'user_joined',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'user_left',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'chat_error',
      expect.any(Function)
    );
  });

  it('closes socket connection on unmount', () => {
    const { unmount } = render(<App />);

    unmount();

    expect(mockSocket.close).toHaveBeenCalled();
  });
});
