import { PrismaClient } from "@prisma/client";

/**
 * List transactions for an organizer's event
 */
const prisma = new PrismaClient();

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  eventId: string,
  ticketCount: number,
  pointsUsed: number = 0,
  paymentProof: string
) {
  // Get event info (you may have ticket price in Event model)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new Error("Event not found");
  if (ticketCount <= 0) throw new Error("Invalid ticket count");

  const totalAmount = event.price * ticketCount - pointsUsed; // adjust for vouchers/coupons if needed
  if (totalAmount < 0) throw new Error("Total amount cannot be negative");

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      eventId,
      ticketCount,
      pointsUsed,
      totalAmount,
      paymentProof,
      status: "WAITING_CONFIRMATION",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 60 min expiration
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, name: true } },
    },
  });

  return transaction;
}

export async function getTransactions(organizerId: string, eventId?: string) {
  const where: any = {
    event: { organizerId },
  };
  if (eventId) where.eventId = eventId;

  return prisma.transaction.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Accept a transaction
 */
export async function acceptTransaction(
  transactionId: string,
  organizerId: string
) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { event: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.event.organizerId !== organizerId) throw new Error("Unauthorized");
  if (tx.status !== "WAITING_CONFIRMATION")
    throw new Error("Transaction cannot be accepted");

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "CONFIRMED" },
    include: {
      user: true,
      event: true,
    },
  });
}

/**
 * Reject a transaction
 */
export async function rejectTransaction(
  transactionId: string,
  organizerId: string
) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { event: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.event.organizerId !== organizerId) throw new Error("Unauthorized");
  if (tx.status !== "WAITING_CONFIRMATION")
    throw new Error("Transaction cannot be rejected");

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "REJECTED" },
    include: {
      user: true,
      event: true,
    },
  });
}

/**
 * Get payment proof URL
 */
export async function getPaymentProof(
  transactionId: string,
  organizerId: string
) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { event: true },
  });

  if (!tx) throw new Error("Transaction not found");
  if (tx.event.organizerId !== organizerId) throw new Error("Unauthorized");

  return tx.paymentProof;
}
