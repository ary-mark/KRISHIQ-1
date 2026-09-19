import { Router } from 'express';
import { getAllCentres, getCentreById, searchCentres } from '../controllers/centreController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public endpoints
router.get('/', getAllCentres);
router.get('/search', searchCentres);
router.get('/:id', getCentreById);

// Admin protected routes (example placeholder)
router.post('/', authenticate, authorize([Role.CENTRE_ADMIN, Role.SYSTEM_ADMIN]), (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;

