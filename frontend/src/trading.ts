import type { Account, Order, Trade } from './types';

type NowFn = () => number;

export function matchOrders(orders: Order[], last: number, now: NowFn = () => Date.now()): {
  orders: Order[];
  fills: Trade[];
} {
  const previous = new Map(orders.map((o) => [o.id, o]));
  const updated: Order[] = [];
  const fills: Trade[] = [];

  for (const order of orders) {
    if (order.status !== 'WORKING') {
      updated.push(order);
      continue;
    }

    const shouldFill =
      order.type === 'MARKET'
        ? true
        : order.side === 'BUY'
        ? last <= (order.limitPrice ?? -Infinity)
        : last >= (order.limitPrice ?? Infinity);

    if (!shouldFill) {
      updated.push(order);
      continue;
    }

    const filledAt = now();
    const filledOrder: Order = {
      ...order,
      status: 'FILLED',
      filledAt,
      avgFillPrice: last,
    };
    updated.push(filledOrder);

    const prev = previous.get(order.id);
    if (prev?.status !== 'FILLED') {
      fills.push({
        orderId: filledOrder.id,
        symbol: filledOrder.symbol,
        side: filledOrder.side,
        qty: filledOrder.qty,
        price: filledOrder.avgFillPrice!,
        ts: filledOrder.filledAt!,
      });
    }
  }

  return { orders: fills.length > 0 ? updated : orders, fills };
}

export function applyTrade(account: Account, trade: Trade): Account {
  const sign = trade.side === 'BUY' ? 1 : -1;
  const cash = account.cash - sign * trade.price * trade.qty;
  const current = account.positions[trade.symbol] ?? { symbol: trade.symbol, qty: 0, avgPrice: 0 };
  const newQty = current.qty + sign * trade.qty;

  let avgPrice = current.avgPrice;
  let realizedPnL = account.realizedPnL;

  const positionSign = Math.sign(current.qty);
  const isClosing = positionSign !== 0 && positionSign !== sign;

  if (isClosing) {
    const closingQty = Math.min(Math.abs(current.qty), trade.qty);
    const plPerShare = trade.side === 'SELL' ? trade.price - current.avgPrice : current.avgPrice - trade.price;
    realizedPnL += plPerShare * closingQty;
  }

  if (current.qty === 0) {
    avgPrice = trade.price;
  } else if (!isClosing) {
    const gross = current.avgPrice * Math.abs(current.qty) + trade.price * trade.qty;
    const denom = Math.abs(newQty);
    avgPrice = denom === 0 ? 0 : gross / denom;
  } else if (newQty !== 0 && Math.sign(newQty) === positionSign) {
    avgPrice = current.avgPrice;
  } else if (newQty !== 0) {
    avgPrice = trade.price;
  } else {
    avgPrice = 0;
  }

  const positions = { ...account.positions };
  if (newQty === 0) {
    delete positions[trade.symbol];
  } else {
    positions[trade.symbol] = { symbol: trade.symbol, qty: newQty, avgPrice };
  }

  return {
    cash,
    realizedPnL,
    positions,
  };
}
