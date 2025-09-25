import { Request, Response } from "express";
import * as statsService from "../services/stats.service";

/**
 * GET /dashboard/stats/registrations?range=week
 * range = year | week | day
 */
export async function getRegistrationTrends(req: Request, res: Response) {
  try {
    const organizerId = req.user?.userId; // from auth middleware
    const range = (req.query.range as string) || "week";

    const stats = await statsService.getRegistrationTrends(
      organizerId as string,
      range
    );

    res.json(stats);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
