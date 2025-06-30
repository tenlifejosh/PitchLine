import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

// Create payment intent for booking
router.post('/create-intent', async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pitcher: true,
        decisionMaker: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(booking.amountCharged) * 100), // Convert to cents
      currency: 'usd',
      customer: booking.pitcher.stripeCustomerId || undefined,
      metadata: {
        bookingId: booking.id,
        pitcherId: booking.pitcherId,
        decisionMakerId: booking.decisionMakerId
      }
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripePaymentIntentId: paymentIntent.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.amountCharged
    });
  } catch (error) {
    next(error);
  }
});

export default router;