import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Define types
type MessagesResponse = {
  messages: Array<{
    id: string;
    username: string;
    text: string;
    timestamp: number;
  }>;
};

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

function mockMessagesResponse(messages: MessagesResponse['messages'] = []) {
  return {
    json: vi.fn().mockResolvedValue({ messages }),
    ok: true,
  };
}

describe('Chat Room App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username entry screen initially', () => {
    render(<App />);

    expect(screen.getByText('Mentat Party Agent 🥳')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the chat room/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your username...')
    ).toBeInTheDocument();
    expect(screen.getByText('Join Chat')).toBeInTheDocument();
  });

  it('disables join button when username is empty', () => {
    render(<App />);

    const joinButton = screen.getByText('Join Chat');
    expect(joinButton).toBeDisabled();
  });

  it('enables join button when username is entered', async () => {
    const user = userEvent.setup();
    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username...');
    const joinButton = screen.getByText('Join Chat');

    await user.type(usernameInput, 'testuser');
    expect(joinButton).not.toBeDisabled();
  });

  it('shows chat interface after username submission', async () => {
    const user = userEvent.setup();
    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockMessagesResponse([])
    );

    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username...');
    const joinButton = screen.getByText('Join Chat');

    await user.type(usernameInput, 'testuser');
    await user.click(joinButton);

    // Should show chat interface
    await waitFor(() => {
      expect(screen.getByText('Logged in as:')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText('Type your message...')
    ).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText(/No messages yet/)).toBeInTheDocument();

    // Should have called messages API
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/messages');
  });

  it('displays messages from server', async () => {
    const user = userEvent.setup();
    const mockMessages = [
      {
        id: '1',
        username: 'alice',
        text: 'Hello everyone!',
        timestamp: Date.now(),
      },
      {
        id: '2',
        username: 'bob',
        text: 'Hi there!',
        timestamp: Date.now() + 1000,
      },
    ];

    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockMessagesResponse(mockMessages)
    );

    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username...');
    const joinButton = screen.getByText('Join Chat');

    await user.type(usernameInput, 'testuser');
    await user.click(joinButton);

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });
});
