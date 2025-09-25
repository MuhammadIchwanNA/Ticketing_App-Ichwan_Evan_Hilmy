import { Router } from "express";
import * as statsController from "../controllers/stats.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get(
  "/events/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  statsController.getRegistrationTrends
);

export default router;
