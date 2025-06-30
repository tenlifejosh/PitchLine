import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get decision makers for browsing
router.get('/decision-makers', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, industry, expertise } = req.query;

    const where: any = {
      role: 'decision_maker',
      decisionMakerProfile: {
        isActive: true
      }
    };

    if (industry) {
      where.decisionMakerProfile.industry = industry;
    }

    if (expertise) {
      where.decisionMakerProfile.expertiseAreas = {
        has: expertise
      };
    }

    const decisionMakers = await prisma.user.findMany({
      where,
      include: {
        decisionMakerProfile: true,
        reviewsReceived: {
          select: {
            rating: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Calculate average ratings
    const enrichedDecisionMakers = decisionMakers.map(dm => ({
      ...dm,
      averageRating: dm.reviewsReceived.length > 0 
        ? dm.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / dm.reviewsReceived.length
        : null,
      totalReviews: dm.reviewsReceived.length
    }));

    const total = await prisma.user.count({ where });

    res.json({
      decisionMakers: enrichedDecisionMakers,
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

export default router;