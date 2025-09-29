import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getEventReviews,
  getOrganizerReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create review
router.post('/', [
  authenticate,
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string')
], validate, createReview);

// Get reviews for an event
router.get('/event/:eventId', getEventReviews);

// Get reviews for an organizer
router.get('/organizer/:organizerId', getOrganizerReviews);

// Update review
router.put('/:reviewId', [
  authenticate,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string')
], validate, updateReview);

// Delete review
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
