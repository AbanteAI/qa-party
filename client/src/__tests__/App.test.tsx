import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';

type FetchResponse = {
  json: () => Promise<any>;
  ok: boolean;
  status?: number;
};

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

function mockFetchResponse(data: any, ok = true, status = 200): FetchResponse {
  return {
    json: vi.fn().mockResolvedValue(data),
    ok,
    status,
  };
}

describe('App - Micro feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders compose box and empty state', async () => {
    // Mock GET /api/tweets -> []
    (globalThis.fetch as unknown as Mock).mockImplementation(
      (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/api/tweets')) {
          return Promise.resolve(mockFetchResponse({ tweets: [] }));
        }
        return Promise.resolve(mockFetchResponse({}, true, 200));
      }
    );

    render(<App />);

    expect(await screen.findByText('Mentat Micro')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('What is happening?!')
    ).toBeInTheDocument();
    expect(screen.getByText('Be the first to post!')).toBeInTheDocument();
  });

  it('posts a tweet and shows it in the timeline', async () => {
    const newTweet = {
      id: 't1',
      text: 'Hello world',
      likes: 0,
      createdAt: Date.now(),
    };

    (globalThis.fetch as unknown as Mock).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        const method = init?.method || 'GET';
        if (url.includes('/api/tweets') && method === 'GET') {
          return Promise.resolve(mockFetchResponse({ tweets: [] }));
        }
        if (url.endsWith('/api/tweets') && method === 'POST') {
          return Promise.resolve(mockFetchResponse({ tweet: newTweet }));
        }
        return Promise.resolve(mockFetchResponse({}, true, 200));
      }
    );

    render(<App />);

    const textarea = await screen.findByPlaceholderText('What is happening?!');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    const postBtn = screen.getByText('Post');
    expect(postBtn).not.toBeDisabled();

    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('likes a tweet (increments count)', async () => {
    const t0 = {
      id: 't1',
      text: 'Like me',
      likes: 0,
      createdAt: Date.now(),
    };
    const t1 = { ...t0, likes: 1 };

    (globalThis.fetch as unknown as Mock).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        const method = init?.method || 'GET';

        if (url.includes('/api/tweets') && method === 'GET') {
          return Promise.resolve(mockFetchResponse({ tweets: [t0] }));
        }
        if (url.endsWith(`/api/tweets/${t0.id}/like`) && method === 'POST') {
          return Promise.resolve(mockFetchResponse({ tweet: t1 }));
        }
        return Promise.resolve(mockFetchResponse({}, true, 200));
      }
    );

    render(<App />);

    expect(await screen.findByText('Like me')).toBeInTheDocument();

    const likeBtn = screen.getByText('❤️ Like');
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(screen.getByText('1 like')).toBeInTheDocument();
    });
  });
});
