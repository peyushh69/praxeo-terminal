import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECTORAL_INDICES } from '../src/data/sectoralIndices.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const list = SECTORAL_INDICES.map(idx => ({
    id: idx.id,
    name: idx.name,
    shortName: idx.shortName,
    ticker: idx.ticker,
    category: idx.category,
    description: idx.description,
    iconName: idx.iconName,
    color: idx.color,
    accentHex: idx.accentHex,
    stocksCount: idx.stocks.length,
  }));
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({ success: true, indices: list });
}
