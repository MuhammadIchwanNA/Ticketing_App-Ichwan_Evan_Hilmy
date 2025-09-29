import request from 'supertest';
import app from '../../src/app';

describe('Event Controller Tests', () => {
  describe('GET /api/events', () => {
    it('should return events with pagination', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should filter events by category', async () => {
      const response = await request(app)
        .get('/api/events?category=Technology')
        .expect(200);

      expect(response.body.events).toBeDefined();
      // If there are events, they should match the category
      if (response.body.events.length > 0) {
        expect(response.body.events[0].category).toBe('Technology');
      }
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/events?page=1&limit=2')
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.events.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});
