import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchMarketBreadth } from '../server/yahoo.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const indexParam = (req.query.index as string) || 'NIFTY_50';
    const symbolParam = (req.query.symbol as string) || '';
    const data = await fetchMarketBreadth(indexParam, false);
    const symbol = symbolParam.toUpperCase();
    const stock = data.stocks.find(
      s => s.symbol === symbol || s.ticker === symbol || s.ticker.startsWith(`${symbol}.`)
    );
    if (!stock) {
      return res.status(404).json({ success: false, error: `Stock ${symbol} not found in index` });
    }
    return res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch stock' });
  }
}
