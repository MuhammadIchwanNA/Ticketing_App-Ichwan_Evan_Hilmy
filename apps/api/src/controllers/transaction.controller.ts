import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";
import { MailerHelper } from "../helpers/mailer.helper";
import { generateTransactionEmail } from "../types/templates/transactionStatus";

/**
 * POST /transactions
 * User creates a transaction for an event
 */
export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = req.user?.userId; // from auth middleware
    const { eventId, ticketCount, pointsUsed, paymentProof } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!eventId || !ticketCount) {
      return res
        .status(400)
        .json({ error: "eventId and ticketCount required" });
    }

    const transaction = await transactionService.createTransaction(
      userId,
      eventId,
      Number(ticketCount),
      Number(pointsUsed) || 0,
      paymentProof
    );

    res.status(201).json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /dashboard/transactions?eventId=...
 * List all transactions for an event (organizer only)
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    const eventId = req.query.eventId as string;
    const transactions = await transactionService.getTransactions(
      eventId
    );
    res.json(transactions);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * PUT /dashboard/transactions/:id/accept
 * Confirm a transaction (mark as CONFIRMED)
 */
export async function acceptTransaction(req: Request, res: Response) {
  try {
    const mailerHelper = new MailerHelper();
    const organizerId = req.user?.userId;
    const transactionId = req.params.id;

    const transaction = await transactionService.acceptTransaction(
      transactionId,
      organizerId as string
    );

    if (!transaction) throw new Error("Transaction not found");

    // Prepare email data
    const mailParams = {
      status: "accepted" as const,
      eventName: transaction.event.name,
      userName: transaction.user.name,
      year: new Date().getFullYear(),
      ticketCount: transaction.ticketCount,
    };

    const html = generateTransactionEmail(mailParams);

    await mailerHelper.sendMail(
      transaction.user.email,
      "Transaction Confirmed",
      html
    );

    res.json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * PUT /dashboard/transactions/:id/reject
 * Reject a transaction
 */
export async function rejectTransaction(req: Request, res: Response) {
  try {
    const mailerHelper = new MailerHelper();
    const organizerId = req.user?.userId;
    const transactionId = req.params.id;

    const transaction = await transactionService.rejectTransaction(
      transactionId,
      organizerId as string
    );

    if (!transaction) throw new Error("Transaction not found");

    const mailParams = {
      status: "rejected" as const,
      eventName: transaction.event.name,
      userName: transaction.user.name,
      year: new Date().getFullYear(),
      ticketCount: transaction.ticketCount,
    };

    const html = generateTransactionEmail(mailParams);

    await mailerHelper.sendMail(
      transaction.user.email,
      "Transaction Rejected",
      html
    );

    res.json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /dashboard/transactions/:id/payment-proof
 * Fetch payment proof (image URL)
 */
export async function getPaymentProof(req: Request, res: Response) {
  try {
    const transactionId = req.params.id;
    const proofUrl = await transactionService.getPaymentProof(
      transactionId,
    );

    if (!proofUrl) {
      return res.status(404).json({ error: "Payment proof not found" });
    }

    res.json({ proofUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
