import request from 'supertest';
import { app } from '../app';

describe('API Endpoints', () => {
  it('should list tweets on GET /api/tweets', async () => {
    const response = await request(app).get('/api/tweets');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tweets');
    expect(Array.isArray(response.body.tweets)).toBe(true);
  });

  it('should serve the React app (or fallback) on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/html');
  });
});
