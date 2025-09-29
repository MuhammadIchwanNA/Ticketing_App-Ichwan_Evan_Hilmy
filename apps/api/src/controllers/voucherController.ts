import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Create voucher (Event organizer only)
export const createVoucher = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.userId;
    const { eventId, code, discount, discountType, maxUses, validFrom, validUntil } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is organizer of the event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: userId
      }
    });

    if (!event) {
      return res.status(403).json({ message: 'You can only create vouchers for your own events' });
    }

    // Check if voucher code already exists for this event
    const existingVoucher = await prisma.voucher.findFirst({
      where: { code, eventId }
    });

    if (existingVoucher) {
      return res.status(400).json({ message: 'Voucher code already exists for this event' });
    }

    // Create voucher
    const voucher = await prisma.voucher.create({
      data: {
        eventId,
        code: code.toUpperCase(),
        discount,
        discountType,
        maxUses,
        startDate: new Date(validFrom),
        endDate: new Date(validUntil)
      },
      include: {
        event: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Voucher created successfully',
      voucher
    });

  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get vouchers for event (organizer only)
export const getEventVouchers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is organizer of the event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: userId
      }
    });

    if (!event) {
      return res.status(403).json({ message: 'Unauthorized to view vouchers for this event' });
    }

    const vouchers = await prisma.voucher.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(vouchers);

  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validate voucher
export const validateVoucher = async (req: Request, res: Response) => {
  try {
    const { code, eventId } = req.body;

    const voucher = await prisma.voucher.findFirst({
      where: {
        code: code.toUpperCase(),
        eventId
      }
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher code' });
    }

    // Check if voucher is within valid date range
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: 'Voucher is not valid at this time' });
    }

    // Check if voucher has remaining uses
    if (voucher.currentUses >= voucher.maxUses) {
      return res.status(400).json({ message: 'Voucher has reached maximum usage limit' });
    }

    res.json({
      message: 'Voucher is valid',
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        discountType: voucher.discountType,
        remainingUses: voucher.maxUses - voucher.currentUses
      }
    });

  } catch (error) {
    console.error('Validate voucher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create system coupon (Admin only - for referral rewards)
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.userId;
    const { code, discount, discountType, validUntil } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        userId,
        code: code.toUpperCase(),
        discount,
        discountType,
        expiresAt: new Date(validUntil)
      }
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user coupons
export const getUserCoupons = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        userId,
        isUsed: false,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(coupons);

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validate coupon
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        userId,
        isUsed: false
      }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or already used coupon code' });
    }

    // Check if coupon is still valid
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    res.json({
      message: 'Coupon is valid',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
