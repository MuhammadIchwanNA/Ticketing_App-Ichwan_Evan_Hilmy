import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Event (Organizers only)
export const createEvent = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      name,
      description,
      price,
      startDate,
      endDate,
      totalSeats,
      location,
      category,
      imageUrl
    } = req.body;

    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        price: parseInt(price),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalSeats: parseInt(totalSeats),
        availableSeats: parseInt(totalSeats), // Initially all seats available
        location,
        category,
        imageUrl,
        organizerId: req.user!.userId
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Events (Public with filters and search)
export const getEvents = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {
      startDate: {
        gte: new Date() // Only show future events
      }
    };

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Location filter
    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice as string);
      if (maxPrice) where.price.lte = parseInt(maxPrice as string);
    }

    // Date range filter
    if (startDate) {
      where.startDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate as string) };
    }

    // Get events with pagination
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              reviews: true,
              transactions: {
                where: { status: 'CONFIRMED' }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' },
        skip: offset,
        take: limitNum
      }),
      prisma.event.count({ where })
    ]);

    // Calculate average rating for each event
    const eventsWithRating = await Promise.all(
      events.map(async (event) => {
        const avgRating = await prisma.review.aggregate({
          where: { eventId: event.id },
          _avg: { rating: true }
        });

        return {
          ...event,
          averageRating: avgRating._avg.rating || 0,
          totalReviews: event._count.reviews,
          totalBookings: event._count.transactions
        };
      })
    );

    res.json({
      events: eventsWithRating,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalEvents: totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Single Event by ID
export const getEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 reviews
        },
        vouchers: {
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            currentUses: { lt: prisma.voucher.fields.maxUses }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { eventId: id },
      _avg: { rating: true }
    });

    res.json({
      event: {
        ...event,
        averageRating: avgRating._avg.rating || 0
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Event (Organizer only - own events)
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ message: 'Access denied. Not your event.' });
    }

    const {
      name,
      description,
      price,
      startDate,
      endDate,
      totalSeats,
      location,
      category,
      imageUrl
    } = req.body;

    // Calculate available seats if total seats changed
    let availableSeats = existingEvent.availableSeats;
    if (totalSeats && totalSeats !== existingEvent.totalSeats) {
      const seatDifference = parseInt(totalSeats) - existingEvent.totalSeats;
      availableSeats = existingEvent.availableSeats + seatDifference;
      
      // Ensure available seats doesn't go negative
      if (availableSeats < 0) {
        return res.status(400).json({ 
          message: 'Cannot reduce seats below already booked tickets' 
        });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseInt(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalSeats: totalSeats ? parseInt(totalSeats) : undefined,
        availableSeats,
        location,
        category,
        imageUrl
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Event (Organizer only - own events)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        transactions: {
          where: {
            status: {
              in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED']
            }
          }
        }
      }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.organizerId !== userId) {
      return res.status(403).json({ message: 'Access denied. Not your event.' });
    }

    // Check if there are active transactions
    if (existingEvent.transactions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with active bookings' 
      });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Events by Organizer (Own events)
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: { organizerId: userId },
        include: {
          _count: {
            select: {
              reviews: true,
              transactions: {
                where: { status: 'CONFIRMED' }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum
      }),
      prisma.event.count({ where: { organizerId: userId } })
    ]);

    // Calculate stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const [avgRating, totalRevenue] = await Promise.all([
          prisma.review.aggregate({
            where: { eventId: event.id },
            _avg: { rating: true }
          }),
          prisma.transaction.aggregate({
            where: { 
              eventId: event.id,
              status: 'CONFIRMED'
            },
            _sum: { totalAmount: true }
          })
        ]);

        return {
          ...event,
          averageRating: avgRating._avg.rating || 0,
          totalReviews: event._count.reviews,
          totalBookings: event._count.transactions,
          totalRevenue: totalRevenue._sum.totalAmount || 0
        };
      })
    );

    res.json({
      events: eventsWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalEvents: totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};