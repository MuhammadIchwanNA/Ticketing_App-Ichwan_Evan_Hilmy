import { Router } from 'express';
import { addReviews, getUnreviewedEvents } from '../controllers/review.controller';
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.get('/', authenticate, getUnreviewedEvents);
router.post('/add-review', authenticate, addReviews);

export default router;