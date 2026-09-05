import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchMarketBreadth, fetchMarketTickers } from './server/yahoo.js';
import { computeRRG } from './server/rrg.js';
import { computeNiftyScatterMatrix } from './server/scatter.js';
import { fetchLiveMarketNews } from './server/news.js';
import { SECTORAL_INDICES } from './src/data/sectoralIndices.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Fast live market ticker endpoint (Nifty 50, Sensex, Bank Nifty)
  app.get('/api/ticker', async (req, res) => {
    try {
      const data = await fetchMarketTickers();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in /api/ticker:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch ticker prices' });
    }
  });

  // Relative Rotation Graph (RRG) API endpoint
  app.get('/api/rrg', async (req, res) => {
    try {
      const benchmark = (req.query.benchmark as string) || '^NSEI';
      const timeframe = (req.query.timeframe as string) || 'daily';
      const trailLength = req.query.trail ? parseInt(req.query.trail as string, 10) : undefined;
      const forceRefresh = req.query.refresh === 'true';

      const data = await computeRRG(benchmark, timeframe, trailLength, forceRefresh);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in /api/rrg:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to compute Relative Rotation Graph' });
    }
  });

  // NIFTY & Sector Cross-Sectional Return Scatter & Alpha Matrix
  app.get('/api/scatter', async (req, res) => {
    try {
      const indexId = (req.query.index as string) || 'NIFTY_50';
      const forceRefresh = req.query.refresh === 'true';
      const data = await computeNiftyScatterMatrix(indexId, forceRefresh);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in /api/scatter:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to compute Return Scatter Matrix' });
    }
  });

  // Real-time market news feed (Google News + Financial RSS Feeds)
  app.get('/api/news', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const news = await fetchLiveMarketNews(forceRefresh);
      res.json({ success: true, data: news, count: news.length });
    } catch (error: any) {
      console.error('Error in /api/news:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch live market news' });
    }
  });

  // Get list of all available indices & sectors
  app.get('/api/indices', (req, res) => {
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
    res.json({ success: true, indices: list });
  });

  // Breadth endpoint supporting multi-index (e.g. /api/breadth?index=NIFTY_AUTO)
  app.get('/api/breadth', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
      const indexParam = (req.query.index as string) || 'NIFTY_50';
      const data = await fetchMarketBreadth(indexParam, forceRefresh);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in /api/breadth:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to calculate market breadth' });
    }
  });

  // Single stock info
  app.get('/api/stock/:symbol', async (req, res) => {
    try {
      const indexParam = (req.query.index as string) || 'NIFTY_50';
      const data = await fetchMarketBreadth(indexParam, false);
      const symbol = req.params.symbol.toUpperCase();
      const stock = data.stocks.find(s => s.symbol === symbol || s.ticker === symbol || s.ticker.startsWith(`${symbol}.`));
      if (!stock) {
        return res.status(404).json({ success: false, error: `Stock ${symbol} not found in index` });
      }
      res.json({ success: true, data: stock });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development vs Production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nifty 50 Market Breadth Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
