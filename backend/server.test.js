const request = require('supertest');
const app = require('./server');

describe('Customer Inquiry API', () => {
  test('health endpoint should return success', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('inquiries endpoint should reject requests without a staff token', async () => {
    const response = await request(app).get('/api/inquiries');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});