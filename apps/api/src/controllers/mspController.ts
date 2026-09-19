import { Request, Response } from 'express';
import { compareWithMsp, getMspReferences } from '../services/mspService';

export const listMspReferences = (_req: Request, res: Response) => {
    res.json({ source: 'demo-reference', references: getMspReferences() });
};

export const compareMarketPrice = (req: Request, res: Response) => {
    const crop = String(req.query.crop ?? '');
    const marketPrice = Number(req.query.marketPrice);
    if (!crop || !Number.isFinite(marketPrice) || marketPrice < 0) {
        return res.status(400).json({ error: 'crop and a valid marketPrice are required' });
    }

    const comparison = compareWithMsp(crop, marketPrice);
    if (!comparison) return res.status(404).json({ error: `No MSP reference found for ${crop}` });
    return res.json(comparison);
};
