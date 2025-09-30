import { Router } from "express";
import {
  addReviews,
  getEventReviews,
  getUnreviewedEvents,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", authenticate, getUnreviewedEvents);
router.get("/:eventId/reviews", getEventReviews);
router.post("/add-review", authenticate, addReviews);

export default router;
