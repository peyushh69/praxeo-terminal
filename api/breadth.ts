import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchMarketBreadth } from '../server/yahoo.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    const indexParam = (req.query.index as string) || 'NIFTY_50';
    const data = await fetchMarketBreadth(indexParam, forceRefresh);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/breadth:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate market breadth',
    });
  }
}
