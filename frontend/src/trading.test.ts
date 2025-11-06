import { describe, expect, it } from 'vitest';
import { applyTrade, matchOrders } from './trading';
import type { Account, Order, Trade } from './types';

const createOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ord',
  symbol: '7203.T',
  side: 'BUY',
  type: 'MARKET',
  qty: 100,
  status: 'WORKING',
  createdAt: 0,
  ...overrides,
});

describe('matchOrders', () => {
  it('fills market orders at the last price', () => {
    const nowValues = [1000];
    const { orders, fills } = matchOrders([createOrder()], 1234, () => nowValues.shift() ?? 0);
    expect(orders[0].status).toBe('FILLED');
    expect(orders[0].avgFillPrice).toBe(1234);
    expect(orders[0].filledAt).toBe(1000);
    expect(fills).toEqual([
      {
        orderId: 'ord',
        symbol: '7203.T',
        side: 'BUY',
        qty: 100,
        price: 1234,
        ts: 1000,
      },
    ] satisfies Trade[]);
  });

  it('respects limit prices based on side', () => {
    const buyLimit = createOrder({ type: 'LIMIT', limitPrice: 1000 });
    const sellLimit = createOrder({ id: 'sell', side: 'SELL', type: 'LIMIT', limitPrice: 1100 });
    const result = matchOrders([buyLimit, sellLimit], 995, () => 1);
    expect(result.orders[0].status).toBe('FILLED');
    expect(result.orders[1].status).toBe('WORKING');
    expect(result.fills).toHaveLength(1);
  });

  it('does not re-create trades for already filled orders', () => {
    const market = createOrder();
    const first = matchOrders([market], 1000, () => 1);
    expect(first.fills).toHaveLength(1);
    const second = matchOrders(first.orders, 1000, () => 2);
    expect(second.fills).toHaveLength(0);
    expect(second.orders[0].filledAt).toBe(1);
  });
});

describe('applyTrade', () => {
  const baseAccount: Account = { cash: 1_000_000, realizedPnL: 0, positions: {} };

  it('increases long exposure for buys', () => {
    const trade: Trade = { orderId: '1', symbol: '7203.T', side: 'BUY', qty: 100, price: 1000, ts: 1 };
    const result = applyTrade(baseAccount, trade);
    expect(result.cash).toBe(1_000_000 - 100_000);
    expect(result.positions['7203.T']).toEqual({ symbol: '7203.T', qty: 100, avgPrice: 1000 });
    expect(result.realizedPnL).toBe(0);
  });

  it('realizes pnl when partially closing longs', () => {
    const account: Account = {
      cash: 500_000,
      realizedPnL: 0,
      positions: { '7203.T': { symbol: '7203.T', qty: 200, avgPrice: 1000 } },
    };
    const trade: Trade = { orderId: 'close', symbol: '7203.T', side: 'SELL', qty: 100, price: 1100, ts: 2 };
    const result = applyTrade(account, trade);
    expect(result.cash).toBe(500_000 + 110_000);
    expect(result.positions['7203.T']).toEqual({ symbol: '7203.T', qty: 100, avgPrice: 1000 });
    expect(result.realizedPnL).toBe(10_000);
  });

  it('handles reversals and removes flat positions', () => {
    const account: Account = {
      cash: 0,
      realizedPnL: 0,
      positions: { '7203.T': { symbol: '7203.T', qty: -100, avgPrice: 1200 } },
    };
    const cover: Trade = { orderId: 'cover', symbol: '7203.T', side: 'BUY', qty: 150, price: 1100, ts: 3 };
    const result = applyTrade(account, cover);
    expect(result.cash).toBe(-1100 * 150);
    expect(result.realizedPnL).toBeCloseTo(10_000, 6);
    expect(result.positions['7203.T']).toEqual({ symbol: '7203.T', qty: 50, avgPrice: 1100 });
  });

  it('drops positions when quantity becomes zero', () => {
    const account: Account = {
      cash: 0,
      realizedPnL: 0,
      positions: { '7203.T': { symbol: '7203.T', qty: 100, avgPrice: 900 } },
    };
    const trade: Trade = { orderId: 'exit', symbol: '7203.T', side: 'SELL', qty: 100, price: 950, ts: 4 };
    const result = applyTrade(account, trade);
    expect(result.positions['7203.T']).toBeUndefined();
    expect(result.realizedPnL).toBe(5_000);
  });
});
