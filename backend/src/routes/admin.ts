import express from 'express';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Admin only routes
router.use(requireRole(['admin']));

router.get('/users', async (req, res) => {
  res.json({ message: 'Admin users endpoint' });
});

export default router;