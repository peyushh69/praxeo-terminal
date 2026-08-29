import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchLiveMarketNews } from '../server/news.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers so it can be called seamlessly
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    const data = await fetchLiveMarketNews(forceRefresh);

    // Cache on Vercel Edge for 60s, serve stale for up to 120s
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Error in /api/news serverless function:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live market news',
    });
  }
}
