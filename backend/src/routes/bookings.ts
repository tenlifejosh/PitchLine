import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import moment from 'moment-timezone';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createBookingSchema = Joi.object({
  decisionMakerId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required(),
  notes: Joi.string().max(1000).optional()
});

const updateBookingSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled', 'completed').required(),
  cancellationReason: Joi.string().optional()
});

// Get user's bookings
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { status, page = 1, limit = 10 } = req.query;

    const whereClause: any = {
      OR: [
        { pitcherId: userId },
        { decisionMakerId: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        pitcher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        decisionMaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            decisionMakerProfile: true
          }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.booking.count({ where: whereClause });

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific booking
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        OR: [
          { pitcherId: userId },
          { decisionMakerId: userId }
        ]
      },
      include: {
        pitcher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        decisionMaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            decisionMakerProfile: true
          }
        },
        reviews: true
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Create booking (Pitcher only)
router.post('/', requireRole(['pitcher']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { decisionMakerId, scheduledAt, notes } = value;
    const pitcherId = req.user!.id;

    // Validate decision maker exists and is active
    const decisionMaker = await prisma.user.findFirst({
      where: {
        id: decisionMakerId,
        role: 'decision_maker'
      },
      include: {
        decisionMakerProfile: true
      }
    });

    if (!decisionMaker || !decisionMaker.decisionMakerProfile?.isActive) {
      throw new AppError('Decision maker not found or not available', 404);
    }

    // Check if time slot is available
    const scheduledDate = new Date(scheduledAt);
    const endTime = new Date(scheduledDate.getTime() + 15 * 60 * 1000); // 15 minutes

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        decisionMakerId,
        status: {
          in: ['pending', 'confirmed']
        },
        scheduledAt: {
          lte: endTime
        },
        AND: {
          scheduledAt: {
            gte: new Date(scheduledDate.getTime() - 15 * 60 * 1000)
          }
        }
      }
    });

    if (conflictingBooking) {
      throw new AppError('Time slot is not available', 409);
    }

    // Calculate pricing
    const hourlyRate = decisionMaker.decisionMakerProfile.hourlyRate;
    const amountCharged = Number(hourlyRate); // $100 for 15 minutes
    const platformFee = Number((amountCharged * 0.10).toFixed(2)); // 10%
    const decisionMakerPayout = Number((amountCharged - platformFee).toFixed(2));

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        pitcherId,
        decisionMakerId,
        scheduledAt: scheduledDate,
        notes,
        amountCharged,
        platformFee,
        decisionMakerPayout,
        status: 'pending'
      },
      include: {
        pitcher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        decisionMaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            decisionMakerProfile: true
          }
        }
      }
    });

    // TODO: Create Stripe payment intent
    // TODO: Send notification emails
    // TODO: Emit socket event for real-time updates

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const { error, value } = updateBookingSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { status, cancellationReason } = value;

    // Find booking and verify permissions
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        OR: [
          { pitcherId: userId },
          { decisionMakerId: userId }
        ]
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Validate status transitions
    if (status === 'confirmed' && userRole !== 'decision_maker') {
      throw new AppError('Only decision makers can confirm bookings', 403);
    }

    if (booking.status === 'completed') {
      throw new AppError('Cannot modify completed booking', 400);
    }

    // Update booking
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'cancelled') {
      updateData.cancelledBy = userId;
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        pitcher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        decisionMaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            decisionMakerProfile: true
          }
        }
      }
    });

    // TODO: Handle payment processing based on status
    // TODO: Send notification emails
    // TODO: Emit socket event

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// Delete/Cancel booking
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        OR: [
          { pitcherId: userId },
          { decisionMakerId: userId }
        ]
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'completed') {
      throw new AppError('Cannot cancel completed booking', 400);
    }

    // Update to cancelled status instead of deleting
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledBy: userId,
        cancelledAt: new Date(),
        cancellationReason: 'Cancelled by user'
      }
    });

    // TODO: Handle refund if payment was processed
    // TODO: Send notification emails

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;