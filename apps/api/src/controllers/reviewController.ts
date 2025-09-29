import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Create review (only after attending event)
export const createReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.userId;
    const { eventId, rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has attended the event (has confirmed transaction)
    const attendedTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      include: {
        event: {
          select: { endDate: true, name: true }
        }
      }
    });

    if (!attendedTransaction) {
      return res.status(403).json({
        message: 'You can only review events you have attended'
      });
    }

    // Check if event has ended
    if (new Date() < attendedTransaction.event.endDate) {
      return res.status(403).json({
        message: 'You can only review events after they have ended'
      });
    }

    // Check if user has already reviewed this event
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this event'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        comment
      },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true }
        }
      }
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews for an event
export const getEventReviews = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const totalReviews = await prisma.review.count({
      where: { eventId }
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      },
      rating: {
        average: avgRating._avg.rating || 0,
        count: avgRating._count.rating
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews by organizer (for organizer profile)
export const getOrganizerReviews = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get all reviews for events organized by this organizer
    const reviews = await prisma.review.findMany({
      where: {
        event: {
          organizerId
        }
      },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true }
        },
        event: {
          select: { id: true, name: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const totalReviews = await prisma.review.count({
      where: {
        event: { organizerId }
      }
    });

    // Calculate average rating for organizer
    const avgRating = await prisma.review.aggregate({
      where: {
        event: { organizerId }
      },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      },
      rating: {
        average: avgRating._avg.rating || 0,
        count: avgRating._count.rating
      }
    });

  } catch (error) {
    console.error('Get organizer reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.userId;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true }
        }
      }
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
