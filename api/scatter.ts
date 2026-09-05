import type { VercelRequest, VercelResponse } from '@vercel/node';
import { computeNiftyScatterMatrix } from '../server/scatter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const indexId = typeof req.query.index === 'string' ? req.query.index : 'NIFTY_50';
    const data = await computeNiftyScatterMatrix(indexId, forceRefresh);
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/scatter:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to compute Return Scatter Matrix',
    });
  }
}
