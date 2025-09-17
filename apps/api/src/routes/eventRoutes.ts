import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
} from '../controllers/eventController';
import { createEventValidation, updateEventValidation } from '../middleware/eventValidation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getEvents);                    // Get all events with filters
router.get('/:id', getEvent);                  // Get single event

// Protected routes - Organizers only
router.post('/', 
  authenticate, 
  authorize('ORGANIZER'), 
  createEventValidation, 
  createEvent
);

router.put('/:id', 
  authenticate, 
  authorize('ORGANIZER'), 
  updateEventValidation, 
  updateEvent
);

router.delete('/:id', 
  authenticate, 
  authorize('ORGANIZER'), 
  deleteEvent
);

router.get('/organizer/my-events', 
  authenticate, 
  authorize('ORGANIZER'), 
  getMyEvents
);

export default router;