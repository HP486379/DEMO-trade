export type Side = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'WORKING' | 'FILLED' | 'CANCELED';

export type Candle = {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Order = {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
  limitPrice?: number;
  status: OrderStatus;
  createdAt: number;
  filledAt?: number;
  avgFillPrice?: number;
};

export type Trade = {
  orderId: string;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  ts: number;
};

export type Position = {
  symbol: string;
  qty: number;
  avgPrice: number;
};

export type Account = {
  cash: number;
  realizedPnL: number;
  positions: Record<string, Position>;
};
