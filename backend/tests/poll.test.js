const request = require('supertest');
const app = require('../app'); // your Express app export

describe('Poll API', () => {
  let token;  // Store JWT token for authenticated routes
  let pollId;

  beforeAll(async () => {
    // Get anon token from /auth/anon
    const res = await request(app).post('/auth/anon');
    token = res.body.token;
  });

  test('POST /poll - create poll', async () => {
    const res = await request(app)
      .post('/poll')
      .send({
        question: 'Favorite color?',
        options: ['red', 'blue', 'green'],
        expiresAt: new Date(Date.now() + 60000).toISOString()
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    pollId = res.body.id;
  });

  test('POST /poll/:id/vote - cast vote', async () => {
    const res = await request(app)
      .post(`/poll/${pollId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ option: 'red' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /poll/:id - get tally', async () => {
    const res = await request(app).get(`/poll/${pollId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.options).toContain('red');
    expect(res.body.tally).toHaveProperty('red');
  });

  test('Rate limiting blocks after 5 votes/second', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/poll/${pollId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ option: 'blue' });
    }
    const res = await request(app)
      .post(`/poll/${pollId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ option: 'blue' });
    expect(res.statusCode).toBe(429);
  });
});
