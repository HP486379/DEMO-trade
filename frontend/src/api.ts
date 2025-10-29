import type { Candle } from './store';

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

export async function fetchPrice(symbol: string): Promise<PriceResponse> {
  return fetchJson<PriceResponse>(`${BASE}/api/price/${symbol}`);
}

export async function fetchOhlc(
  symbol: string,
  interval = '5m',
  range = '1d',
): Promise<OhlcResponse> {
  const params = new URLSearchParams({ interval, range }).toString();
  return fetchJson<OhlcResponse>(`${BASE}/api/ohlc/${symbol}?${params}`);
}
