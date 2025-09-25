import request from 'supertest';
import { app } from '../app';

describe('Tweets API', () => {
  it('lists tweets (initially empty)', async () => {
    const res = await request(app).get('/api/tweets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
  });

  it('rejects invalid tweet', async () => {
    const res = await request(app).post('/api/tweets').send({ text: '' });
    expect(res.status).toBe(400);
  });

  it('creates and likes a tweet', async () => {
    const post = await request(app).post('/api/tweets').send({ text: 'Hello' });
    expect(post.status).toBe(201);
    const id = post.body.tweet.id as string;

    const like = await request(app).post(`/api/tweets/${id}/like`);
    expect(like.status).toBe(200);
    expect(like.body.tweet.likes).toBe(1);
  });
});
