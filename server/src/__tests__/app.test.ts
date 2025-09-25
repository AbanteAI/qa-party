import request from 'supertest';
import { app } from '../app';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

const TEST_BULLETINS_FILE = path.join(__dirname, '../../../bulletins.txt');

describe('API Endpoints', () => {
  // Clean up test bulletins file after each test
  afterEach(() => {
    if (existsSync(TEST_BULLETINS_FILE)) {
      unlinkSync(TEST_BULLETINS_FILE);
    }
  });

  it('should return welcome message on GET /api', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Welcome to the Mentat Bulletin Board API!'
    );
  });

  it('should serve the React app on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/html');
  });

  it('should return empty bulletins array on GET /api/bulletins when no bulletins exist', async () => {
    const response = await request(app).get('/api/bulletins');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('bulletins');
    expect(response.body.bulletins).toEqual([]);
  });

  it('should create a new bulletin on POST /api/bulletins', async () => {
    const testMessage = 'Test bulletin message';
    const response = await request(app)
      .post('/api/bulletins')
      .send({ message: testMessage });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('bulletin');
    expect(response.body.bulletin).toHaveProperty('message', testMessage);
    expect(response.body.bulletin).toHaveProperty('timestamp');
    expect(response.body.bulletin).toHaveProperty('id');
  });

  it('should return 400 for empty message on POST /api/bulletins', async () => {
    const response = await request(app)
      .post('/api/bulletins')
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Message is required');
  });

  it('should retrieve bulletins after posting on GET /api/bulletins', async () => {
    const testMessage = 'Test bulletin for retrieval';

    // Post a bulletin
    await request(app).post('/api/bulletins').send({ message: testMessage });

    // Retrieve bulletins
    const response = await request(app).get('/api/bulletins');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('bulletins');
    expect(response.body.bulletins).toHaveLength(1);
    expect(response.body.bulletins[0]).toHaveProperty('message', testMessage);
  });
});
