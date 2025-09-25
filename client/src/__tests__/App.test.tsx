import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Define types
type BulletinsResponse = {
  bulletins: Array<{
    id: string;
    timestamp: string;
    message: string;
  }>;
};

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

function mockBulletinsResponse(bulletins: BulletinsResponse['bulletins'] = []) {
  return {
    json: vi.fn().mockResolvedValue({ bulletins }),
    ok: true,
  };
}

function mockPostResponse(bulletin: BulletinsResponse['bulletins'][0]) {
  return {
    json: vi.fn().mockResolvedValue({ success: true, bulletin }),
    ok: true,
  };
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for empty bulletins
    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockBulletinsResponse([])
    );
  });

  it('renders bulletin board correctly', async () => {
    render(<App />);

    expect(screen.getByText('📋 Mentat Bulletin Board')).toBeInTheDocument();
    expect(
      screen.getByText('Share your thoughts with the community!')
    ).toBeInTheDocument();
    expect(screen.getByText('📝 Post a New Bulletin')).toBeInTheDocument();
    expect(screen.getByText('📰 Latest Bulletins')).toBeInTheDocument();

    // Should show empty state initially
    await waitFor(() => {
      expect(
        screen.getByText('📭 No bulletins yet. Be the first to post one!')
      ).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bulletins');
  });

  it('loads and displays bulletins', async () => {
    const mockBulletins = [
      {
        id: '2023-01-01T00:00:00.000Z',
        timestamp: '2023-01-01T00:00:00.000Z',
        message: 'Test bulletin message',
      },
    ];

    (globalThis.fetch as unknown as Mock).mockResolvedValue(
      mockBulletinsResponse(mockBulletins)
    );

    render(<App />);

    // Wait for the bulletins to load
    await waitFor(() => {
      expect(screen.getByText('Test bulletin message')).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bulletins');
  });

  it('handles API error when loading bulletins', async () => {
    // Mock a failed API call
    (globalThis.fetch as unknown as Mock).mockRejectedValue(
      new Error('Failed to load bulletins')
    );

    render(<App />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load bulletins/)).toBeInTheDocument();
    });
  });

  it('allows posting new bulletins', async () => {
    const user = userEvent.setup();

    // Mock successful bulletin posting
    (globalThis.fetch as unknown as Mock)
      .mockResolvedValueOnce(mockBulletinsResponse([])) // Initial load
      .mockResolvedValueOnce(
        mockPostResponse({
          id: '2023-01-01T00:00:00.000Z',
          timestamp: '2023-01-01T00:00:00.000Z',
          message: 'New test bulletin',
        })
      ) // Post request
      .mockResolvedValueOnce(
        mockBulletinsResponse([
          {
            id: '2023-01-01T00:00:00.000Z',
            timestamp: '2023-01-01T00:00:00.000Z',
            message: 'New test bulletin',
          },
        ])
      ); // Refresh after post

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(
        screen.getByText('📭 No bulletins yet. Be the first to post one!')
      ).toBeInTheDocument();
    });

    // Type in the textarea
    const textarea = screen.getByPlaceholderText(
      "What's on your mind? Share it with everyone..."
    );
    await user.type(textarea, 'New test bulletin');

    // Submit the form
    const submitButton = screen.getByText('📤 Post Bulletin');
    await user.click(submitButton);

    // Verify the POST request was made
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/bulletins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'New test bulletin' }),
      });
    });
  });
});
