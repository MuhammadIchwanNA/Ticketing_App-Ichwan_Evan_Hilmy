import { Request, Response } from "express";
import { getUnreviewedEvent, addReview } from "../services/review.service";

    export async function getUnreviewedEvents(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // assuming auth middleware sets req.user
      const events = await getUnreviewedEvent(userId as string);
      return res.json({ events });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

    export async function addReviews(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { eventId, rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const review = await addReview(userId as string, eventId, rating, comment);
      return res.json({ review });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

