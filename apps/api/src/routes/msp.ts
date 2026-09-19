import { Router } from 'express';
import { compareMarketPrice, listMspReferences } from '../controllers/mspController';

const router = Router();

router.get('/', listMspReferences);
router.get('/compare', compareMarketPrice);

export default router;
