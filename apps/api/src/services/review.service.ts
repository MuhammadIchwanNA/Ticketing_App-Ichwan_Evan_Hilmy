import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

  /**   
   * * Get all events a user has attended but not yet reviewed
   */
  export async function getUnreviewedEvent(userId: string) {
    const now = new Date();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status: "CONFIRMED",
        event: {
          endDate: { lt: now }, // event has ended
        },
        // exclude transactions where user already reviewed the event
        eventId: {
          notIn: (
            await prisma.review.findMany({
              where: { userId },
              select: { eventId: true },
            })
          ).map((r) => r.eventId),
        },
      },
      include: {
        event: true,
      },
    });

    return transactions.map((t) => ({
      userId: t.userId,
      eventId: t.event.id,
      name: t.event.name,
      description: t.event.description,
      endDate: t.event.endDate,
      totalAmount: t.totalAmount,
    }));
  }

  /**
   * Add a review for an event the user attended
   */
  export async function addReview(userId: string, eventId: string, rating: number, comment?: string) {
    // check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existingReview) {
      throw new Error("You have already reviewed this event.");
    }

    // validate attendance
    const attended = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: "CONFIRMED",
        event: { endDate: { lt: new Date() } },
      },
    });
    if (!attended) {
      throw new Error("You cannot review this event because you did not attend.");
    }

    return prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        comment,
      },
    });
  }

/**
 * Get all reviews for a specific event
 */
export async function getReviewsByEventId(eventId: string) {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" }, // newest first
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    user: {
      id: r.user.id,
      name: r.user.name,
      profilePicture: r.user.profilePicture,
    },
  }));
}
