import request from 'supertest';import app from '../../src/app';

describe('Authentication Tests', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `testauth${timestamp}@example.com`,
    password: '123456',
    name: 'Test Auth User',
    role: 'CUSTOMER'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe('CUSTOMER');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
