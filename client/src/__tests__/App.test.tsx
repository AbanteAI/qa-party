import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Define types
type ChatMessage = {
  id: string;
  username: string;
  message: string;
  timestamp: string;
};

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

function mockMessagesResponse(messages: ChatMessage[]) {
  return {
    json: vi.fn().mockResolvedValue(messages),
    ok: true,
  };
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation - empty messages array
    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockMessagesResponse([])
    );
  });

  it('renders chatroom component correctly', () => {
    render(<App />);
    expect(screen.getByText('🎉 Mentat Party Chatroom')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to the Mentat Party! 🎊')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your username')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Type your message...')
    ).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('loads and displays messages', async () => {
    const testMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'TestUser',
        message: 'Hello World!',
        timestamp: '2025-09-25T06:00:00.000Z',
      },
    ];

    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockMessagesResponse(testMessages)
    );

    render(<App />);

    // Wait for the message to appear
    await waitFor(() => {
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
      expect(screen.getByText('<TestUser>')).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/messages');
  });

  it('handles API error', async () => {
    // Mock a failed API call
    (globalThis.fetch as unknown as Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(<App />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch messages/)).toBeInTheDocument();
    });
  });
});
