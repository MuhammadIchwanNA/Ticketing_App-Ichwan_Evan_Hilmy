import { PrismaClient } from "@prisma/client";
import { subYears, subWeeks, subDays } from "date-fns";

const prisma = new PrismaClient();

export async function getRegistrationTrends(
  organizerId: string,
  range: string
) {
  // Set time range
  let startDate: Date;
  if (range === "year") {
    startDate = subYears(new Date(), 3); // last 3 years
  } else if (range === "week") {
    startDate = subWeeks(new Date(), 3); // last 3 weeks
  } else if (range === "day") {
    startDate = subDays(new Date(), 6); // last 7 days
  } else {
    throw new Error("Invalid range. Use year | week | day");
  }

  // Fetch all confirmed registrations across all events for the organizer
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: startDate },
      event: { organizerId },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  // Group into buckets
  const grouped: Record<string, number> = {};

  for (const tx of transactions) {
    let key: string;

    if (range === "year") {
      const diff = new Date().getFullYear() - tx.createdAt.getFullYear();
      key = `Year ${diff === 0 ? 1 : diff + 1}`;
    } else if (range === "week") {
      // get ISO week number
      const weekNum = Math.ceil(
        (tx.createdAt.getDate() - tx.createdAt.getDay() + 1) / 7
      );
      key = `Week ${weekNum}`;
    } else {
      const dayDiff = Math.floor(
        (new Date().getTime() - tx.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      key = `Day ${dayDiff === 0 ? 1 : dayDiff + 1}`;
    }

    grouped[key] = (grouped[key] || 0) + 1;
  }

  // Convert to sorted array
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, registrations]) => ({
      date,
      registrations,
    }));
}
