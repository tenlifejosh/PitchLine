import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create review
router.post('/', async (req, res, next) => {
  try {
    const { bookingId, revieweeId, rating, comment } = req.body;
    
    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: req.user?.id || '',
        revieweeId,
        rating,
        comment
      }
    });

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

export default router;