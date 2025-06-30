import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get availability for a decision maker
router.get('/:dmId', async (req, res, next) => {
  try {
    const { dmId } = req.params;
    
    const availability = await prisma.availabilitySlot.findMany({
      where: {
        decisionMakerId: dmId,
        isActive: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({ availability });
  } catch (error) {
    next(error);
  }
});

export default router;