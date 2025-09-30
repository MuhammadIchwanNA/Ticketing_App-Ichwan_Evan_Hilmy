import { PrismaClient } from "@prisma/client";
import { subYears, subWeeks, subDays, startOfDay, startOfWeek } from "date-fns";

const prisma = new PrismaClient();

export async function getRegistrationTrends(
  organizerId: string,
  range: string,
) {
  // Compute start date (last 3 buckets back)
  let startDate: Date;
  if (range === "year") {
    startDate = subYears(new Date(), 2); // 3 years: current + last + last 2
  } else if (range === "week") {
    startDate = subWeeks(new Date(), 2); // last 3 weeks
  } else if (range === "day") {
    startDate = subDays(new Date(), 2); // last 3 days
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
      createdAt: true,
    },
  });

  // Initialize buckets
  const buckets: { [key: string]: number } = {
    "Last 2": 0,
    Last: 0,
    Current: 0,
  };

  for (const tx of transactions) {
    let bucket: string;

    if (range === "year") {
      const diff = new Date().getFullYear() - tx.createdAt.getFullYear();
      if (diff === 2) bucket = "Last 2";
      else if (diff === 1) bucket = "Last";
      else bucket = "Current";
    } else if (range === "week") {
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const lastWeekStart = subWeeks(currentWeekStart, 1);

      if (tx.createdAt >= currentWeekStart) bucket = "Current";
      else if (tx.createdAt >= lastWeekStart) bucket = "Last";
      else bucket = "Last 2";
    } else {
      const todayStart = startOfDay(new Date());
      const yesterdayStart = subDays(todayStart, 1);

      if (tx.createdAt >= todayStart) bucket = "Current";
      else if (tx.createdAt >= yesterdayStart) bucket = "Last";
      else bucket = "Last 2";
    }

    buckets[bucket] = (buckets[bucket] || 0) + 1;
  }

  // Format final output with nice labels
  const labelMap: Record<string, string> = {
    year: "Year",
    week: "Week",
    day: "Day",
  };

  return [
    { date: `Last 2 ${labelMap[range]}`, registrations: buckets["Last 2"] },
    { date: `Last ${labelMap[range]}`, registrations: buckets["Last"] },
    { date: `Current ${labelMap[range]}`, registrations: buckets["Current"] },
  ];
}
