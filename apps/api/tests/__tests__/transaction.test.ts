import request from 'supertest';
import app from '../../src/app';

describe('Transaction Controller Tests', () => {
  let authToken: string;
  let eventId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'transaction-test@example.com',
        password: '123456',
        name: 'Transaction Test User',
        role: 'CUSTOMER'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'transaction-test@example.com',
        password: '123456'
      });

    authToken = loginResponse.body.token;

    // Get existing event ID for testing
    const eventsResponse = await request(app)
      .get('/api/events')
      .expect(200);
    
    if (eventsResponse.body.events.length > 0) {
      eventId = eventsResponse.body.events[0].id;
    }
  });

  describe('POST /api/transactions', () => {
    it('should create transaction with valid data', async () => {
      if (!eventId) {
        console.log('Skipping transaction test - no events available');
        return;
      }

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 1,
          pointsUsed: 0
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('transaction');
      expect(response.body.transaction.ticketCount).toBe(1);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          eventId: 'some-event-id',
          ticketCount: 1
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid event', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: 'invalid-event-id',
          ticketCount: 1
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/transactions', () => {
    it('should get user transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
