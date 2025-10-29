import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const CACHE = new Map(); // key -> { ts: number, data: any }

function getCache(key, ttlMs) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  CACHE.set(key, { ts: Date.now(), data });
}

async function yahooChart(symbol, params = { interval: '5m', range: '1d' }) {
  const query = new URLSearchParams(params).toString();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?${query}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JP-Demo-Trade/1.0)' },
  });
  if (!res.ok) {
    throw new Error(`Yahoo chart fetch failed: ${res.status}`);
  }
  return res.json();
}

app.get('/api/price/:symbol', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const cacheKey = `price:${symbol}`;
    const cached = getCache(cacheKey, 10_000);
    if (cached) {
      return res.json(cached);
    }
    const data = await yahooChart(symbol, { interval: '1m', range: '1d' });
    const payload = parsePriceFromYahoo(data);
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: String(err) });
  }
});

app.get('/api/ohlc/:symbol', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const interval = req.query.interval || '5m';
    const range = req.query.range || '1d';
    const cacheKey = `ohlc:${symbol}:${interval}:${range}`;
    const cached = getCache(cacheKey, 30_000);
    if (cached) {
      return res.json(cached);
    }
    const data = await yahooChart(symbol, { interval, range });
    const payload = parseOhlcFromYahoo(symbol, interval, range, data);
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: String(err) });
  }
});

function normalizeSymbol(symbol) {
  if (!symbol) return symbol;
  return /\.T$/.test(symbol) ? symbol : `${symbol}.T`;
}

function parsePriceFromYahoo(resp) {
  const result = resp?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};
  const closes = quote.close || [];
  const volumes = quote.volume || [];
  const lastIndex = closes.length - 1;
  const last = lastIndex >= 0 ? closes[lastIndex] : null;
  const volume = lastIndex >= 0 ? volumes[lastIndex] ?? null : null;
  const tsSource = lastIndex >= 0 && timestamps[lastIndex]
    ? new Date(timestamps[lastIndex] * 1000).toISOString()
    : null;
  return {
    symbol: result?.meta?.symbol || '',
    last,
    change: null,
    changePct: null,
    volume,
    tsSource,
    tsServer: new Date().toISOString(),
    delayed: true,
  };
}

function parseOhlcFromYahoo(symbol, interval, range, resp) {
  const result = resp?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};
  const candles = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i];
    if ([open, high, low, close].some((v) => v == null)) {
      continue;
    }
    candles.push({
      t: timestamps[i] * 1000,
      open,
      high,
      low,
      close,
      volume: volume ?? 0,
    });
  }
  return { symbol, interval, range, candles };
}

app.listen(PORT, () => {
  console.log(`backend on :${PORT}`);
});
