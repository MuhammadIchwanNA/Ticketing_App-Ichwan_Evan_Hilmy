import { PrismaClient } from "@prisma/client";

/**
 * Get attendees of a specific event (only confirmed transactions)
 */

const prisma = new PrismaClient();
export async function getAttendees(organizerId: string, eventId: string) {
  // Check if the event belongs to the organizer
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");
  if (event.organizerId !== organizerId) throw new Error("Unauthorized");

  // Fetch confirmed transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      eventId,
      status: "CONFIRMED",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Transform into attendee list
  return transactions.map((tx) => ({
    attendeeId: tx.user.id,
    name: tx.user.name,
    email: tx.user.email,
    ticketCount: tx.ticketCount,
    totalPaid: tx.totalAmount,
    confirmedAt: tx.updatedAt,
  }));
}
