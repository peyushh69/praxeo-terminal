import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchMarketTickers } from '../server/yahoo.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const data = await fetchMarketTickers();
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/ticker:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ticker prices',
    });
  }
}
