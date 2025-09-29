import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple transaction creation
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { eventId, ticketCount, pointsUsed = 0 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!eventId || !ticketCount || ticketCount <= 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check available seats
    if (event.availableSeats < ticketCount) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check points balance if using points
    if (pointsUsed > 0 && pointsUsed > user.pointsBalance) {
      return res.status(400).json({ message: 'Insufficient points balance' });
    }

    // Calculate total amount
    const baseAmount = event.price * ticketCount;
    const finalAmount = Math.max(0, baseAmount - pointsUsed);

    // Set expiration time (2 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    // Create transaction with database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update event available seats
      await tx.event.update({
        where: { id: eventId },
        data: { availableSeats: { decrement: ticketCount } }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          eventId,
          ticketCount,
          totalAmount: finalAmount,
          pointsUsed: pointsUsed || 0,
          expiresAt,
          status: finalAmount === 0 ? 'CONFIRMED' : 'WAITING_PAYMENT'
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { 
            select: { 
              id: true, 
              name: true, 
              price: true, 
              startDate: true, 
              location: true 
            } 
          }
        }
      });

      // Deduct points if used
      if (pointsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { pointsBalance: { decrement: pointsUsed } }
        });

        // Create points history
        await tx.pointsHistory.create({
          data: {
            userId,
            points: -pointsUsed,
            type: 'USED',
            description: `Used for event: ${event.name}`,
            expiresAt: null
          }
        });
      }

      return transaction;
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: result
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get user transactions or organizer event transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { eventId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let whereClause: any = {};
    let includeClause: any = {
      event: {
        select: {
          id: true,
          name: true,
          startDate: true,
          location: true,
          imageUrl: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    };

    if (eventId) {
      // For organizer viewing transactions of their events
      // First verify the user is the organizer of this event
      const event = await prisma.event.findFirst({
        where: {
          id: eventId as string,
          organizerId: userId
        }
      });

      if (!event) {
        return res.status(403).json({ message: 'Not authorized to view these transactions' });
      }

      whereClause = { eventId: eventId as string };
    } else {
      // For regular users viewing their own transactions
      whereClause = { userId };
      // Remove user info for own transactions (not needed)
      delete includeClause.user;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId // Only allow user to see their own transactions
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
            price: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
