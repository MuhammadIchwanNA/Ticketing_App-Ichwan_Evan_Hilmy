import { Router } from "express";
import * as attendeeController from "../controllers/attendees.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get(
  "/events/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  attendeeController.getAttendees,
);

export default router;
