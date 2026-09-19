import { Router } from 'express';
import { Role } from '@prisma/client';
import { sendSmsNotification } from '../controllers/smsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize([Role.FARMER, Role.CENTRE_ADMIN, Role.SYSTEM_ADMIN]), sendSmsNotification);

export default router;
