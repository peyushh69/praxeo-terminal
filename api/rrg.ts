import type { VercelRequest, VercelResponse } from '@vercel/node';
import { computeRRG } from '../server/rrg.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const benchmark = (req.query.benchmark as string) || '^NSEI';
    const timeframe = (req.query.timeframe as string) || 'daily';
    const trailLength = parseInt(req.query.trail as string, 10) || 8;
    const forceRefresh = req.query.refresh === 'true';

    const data = await computeRRG(benchmark, timeframe, trailLength, forceRefresh);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/rrg:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compute Relative Rotation Graph',
    });
  }
}
