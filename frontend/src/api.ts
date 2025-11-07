import type { Candle, MarketSession } from './store';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type PriceResponse = {
  symbol: string;
  last: number | null;
  change: number | null;
  changePct: number | null;
  volume: number | null;
  tsSource: string | null;
  tsServer: string;
  delayed: boolean;
};

export type OhlcResponse = {
  symbol: string;
  interval: string;
  range: string;
  candles: Candle[];
};

export async function fetchPrice(
  symbol: string,
  session: MarketSession = 'regular',
): Promise<PriceResponse> {
  const params = new URLSearchParams();
  if (session === 'pts') {
    params.set('session', 'pts');
  }
  const query = params.toString();
  const url = query ? `${BASE}/api/price/${symbol}?${query}` : `${BASE}/api/price/${symbol}`;
  return fetchJson<PriceResponse>(url);
}

export async function fetchOhlc(
  symbol: string,
  interval = '5m',
  range = '1d',
  session: MarketSession = 'regular',
): Promise<OhlcResponse> {
  const params = new URLSearchParams({ interval, range });
  if (session === 'pts') {
    params.set('session', 'pts');
  }
  const query = params.toString();
  return fetchJson<OhlcResponse>(`${BASE}/api/ohlc/${symbol}?${query}`);
}
