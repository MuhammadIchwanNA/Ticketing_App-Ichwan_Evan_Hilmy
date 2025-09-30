import { Request, Response } from "express";
import * as attendeeService from "../services/attendees.service";

/**
 * GET /dashboard/events/:eventId/attendees
 * Returns a list of confirmed attendees for an event
 */
export async function getAttendees(req: Request, res: Response) {
  try {
    const organizerId = req.user?.userId; // from auth middleware
    const eventId = req.params.eventId;

    const attendees = await attendeeService.getAttendees(
      organizerId as string,
      eventId,
    );
    res.json(attendees);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
