import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/payment-proofs';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
    }
  }
});

export const uploadMiddleware: any = upload.single('paymentProof');

// Create transaction (ticket purchase)
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { eventId, ticketCount, voucherCodes, couponCodes, pointsUsed, referralCode } = req.body;

    // Validate event and availability
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < ticketCount) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    // Get user for points validation  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pointsBalance: true, referredBy: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (pointsUsed > user.pointsBalance) {
      return res.status(400).json({ message: 'Insufficient points balance' });
    }

    // Calculate total amount
    let totalAmount = event.price * ticketCount;
    let discountAmount = 0;
    const validVouchers: any[] = [];
    const validCoupons: any[] = [];

    // Validate and apply vouchers
    if (voucherCodes && voucherCodes.length > 0) {
      for (const code of voucherCodes) {
        const voucher = await prisma.voucher.findUnique({
          where: { code }
        });

        if (voucher && voucher.eventId === eventId && voucher.currentUses < voucher.maxUses) {
          const now = new Date();
          if (now >= voucher.startDate && now <= voucher.endDate) {
            validVouchers.push(voucher);
          }
        }
      }
    }

    // Validate and apply coupons
    if (couponCodes && couponCodes.length > 0) {
      for (const code of couponCodes) {
        const coupon = await prisma.coupon.findUnique({
          where: { code, userId }
        });

        if (coupon && !coupon.isUsed && new Date() <= coupon.expiresAt) {
          validCoupons.push(coupon);
        }
      }
    }

    // Apply discounts
    for (const voucher of validVouchers) {
      if (voucher.discountType === 'PERCENTAGE') {
        discountAmount += (totalAmount * voucher.discount) / 100;
      } else {
        discountAmount += voucher.discount;
      }
    }

    for (const coupon of validCoupons) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount += (totalAmount * coupon.discount) / 100;
      } else {
        discountAmount += coupon.discount;
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount - (pointsUsed || 0));

    // Set expiration time (2 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Lock seats
      await tx.event.update({
        where: { id: eventId },
        data: { availableSeats: { decrement: ticketCount } }
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          eventId,
          ticketCount,
          totalAmount: finalAmount,
          pointsUsed: pointsUsed || 0,
          expiresAt,
          status: finalAmount === 0 ? 'CONFIRMED' : 'WAITING_PAYMENT'
        }
      });

      // Use points if any
      if (pointsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { pointsBalance: { decrement: pointsUsed } }
        });

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

      // Link vouchers and update usage
      for (const voucher of validVouchers) {
        await tx.transactionVoucher.create({
          data: {
            transactionId: transaction.id,
            voucherId: voucher.id
          }
        });

        await tx.voucher.update({
          where: { id: voucher.id },
          data: { currentUses: { increment: 1 } }
        });
      }

      // Link coupons and mark as used
      for (const coupon of validCoupons) {
        await tx.transactionCoupon.create({
          data: {
            transactionId: transaction.id,
            couponId: coupon.id
          }
        });

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { isUsed: true }
        });
      }

      // Handle referral code
      if (referralCode && user.referredBy === null) {
        const referrer = await tx.user.findUnique({
          where: { referralCode }
        });

        if (referrer && referrer.id !== userId) {
          // Update user with referrer info
          await tx.user.update({
            where: { id: userId },
            data: { referredBy: referrer.id }
          });

          // Give referrer points
          await tx.user.update({
            where: { id: referrer.id },
            data: { pointsBalance: { increment: 10000 } }
          });

          // Create referrer points history
          await tx.pointsHistory.create({
            data: {
              userId: referrer.id,
              points: 10000,
              type: 'EARNED',
              description: `Referral bonus from ${user.name}`,
              expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
          });
        }
      }

      return transaction;
    });

    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: result.id },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: fullTransaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Upload payment proof
export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId,
        status: 'WAITING_PAYMENT'
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or not eligible for payment proof' });
    }

    // Check if not expired
    if (transaction.expiresAt && new Date() > transaction.expiresAt) {
      return res.status(400).json({ message: 'Transaction has expired' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: req.file.path,
        status: 'WAITING_CONFIRMATION'
      },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      message: 'Payment proof uploaded successfully',
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true
          }
        },
        vouchers: {
          include: { voucher: true }
        },
        coupons: {
          include: { coupon: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId 
      },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
        vouchers: {
          include: { voucher: true }
        },
        coupons: {
          include: { coupon: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);

  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel transaction
export const cancelTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId,
        status: { in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION'] }
      },
      include: {
        event: true,
        vouchers: { include: { voucher: true } },
        coupons: { include: { coupon: true } }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or cannot be canceled' });
    }

    // Rollback transaction
    await prisma.$transaction(async (tx) => {
      // Restore seats
      await tx.event.update({
        where: { id: transaction.eventId },
        data: { availableSeats: { increment: transaction.ticketCount } }
      });

      // Restore points if used
      if (transaction.pointsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { pointsBalance: { increment: transaction.pointsUsed } }
        });

        await tx.pointsHistory.create({
          data: {
            userId,
            points: transaction.pointsUsed,
            type: 'EARNED',
            description: `Refund from canceled transaction: ${transaction.event.name}`,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        });
      }

      // Restore voucher usage
      for (const tv of transaction.vouchers) {
        await tx.voucher.update({
          where: { id: tv.voucher.id },
          data: { currentUses: { decrement: 1 } }
        });
      }

      // Restore coupons
      for (const tc of transaction.coupons) {
        await tx.coupon.update({
          where: { id: tc.coupon.id },
          data: { isUsed: false }
        });
      }

      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELED' }
      });
    });

    res.json({ message: 'Transaction canceled successfully' });

  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Organizer: Confirm or reject payment
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;
    const { action } = req.body; // 'confirm' or 'reject'

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        status: 'WAITING_CONFIRMATION',
        event: { organizerId: userId }
      },
      include: {
        event: true,
        user: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or not authorized' });
    }

    if (action === 'confirm') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CONFIRMED' }
      });

      res.json({ message: 'Payment confirmed successfully' });
    } else if (action === 'reject') {
      // Rollback and set as rejected
      await prisma.$transaction(async (tx) => {
        // Restore seats
        await tx.event.update({
          where: { id: transaction.eventId },
          data: { availableSeats: { increment: transaction.ticketCount } }
        });

        // Restore points if used
        if (transaction.pointsUsed > 0) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: { pointsBalance: { increment: transaction.pointsUsed } }
          });

          await tx.pointsHistory.create({
            data: {
              userId: transaction.userId,
              points: transaction.pointsUsed,
              type: 'EARNED',
              description: `Refund from rejected transaction: ${transaction.event.name}`,
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
          });
        }

        // Update transaction status
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: 'REJECTED' }
        });
      });

      res.json({ message: 'Payment rejected successfully' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};