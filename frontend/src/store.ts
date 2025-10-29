import { create } from 'zustand';
import { enforceLot, snapToJpTick } from './marketJp';
import { applyTrade, matchOrders } from './trading';
import type { Account, Candle, Order, Trade } from './types';

type StoreState = {
  symbol: string;
  last: number | null;
  candles: Candle[];
  account: Account;
  orders: Order[];
  trades: Trade[];
  oneShare: boolean;
  setSymbol: (symbol: string) => void;
  setLast: (price: number | null) => void;
  setCandles: (candles: Candle[]) => void;
  placeOrder: (
    order: Omit<Order, 'id' | 'status' | 'createdAt' | 'filledAt' | 'avgFillPrice'>,
  ) => void;
  cancel: (id: string) => void;
  match: () => void;
  load: () => void;
  save: () => void;
  toggleOneShare: () => void;
};

const STORAGE_KEY = 'jp-demo-trade-state';

const createInitialAccount = (): Account => ({
  cash: 10_000_000,
  realizedPnL: 0,
  positions: {},
});

const createInitialState = () => ({
  symbol: '7203.T',
  last: null as number | null,
  candles: [] as Candle[],
  account: createInitialAccount(),
  orders: [] as Order[],
  trades: [] as Trade[],
  oneShare: false,
});

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useStore = create<StoreState>((set, get) => ({
  ...createInitialState(),

  setSymbol: (symbol) => set({ symbol }),
  setLast: (price) => set({ last: price }),
  setCandles: (candles) => set({ candles }),

  placeOrder: (order) => {
    const qty = enforceLot(order.qty, get().oneShare);
    if (qty <= 0) {
      return;
    }

    const limitPrice =
      order.type === 'LIMIT' && order.limitPrice != null
        ? snapToJpTick(order.limitPrice)
        : undefined;

    const newOrder: Order = {
      id: generateId(),
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      qty,
      limitPrice,
      status: 'WORKING',
      createdAt: Date.now(),
    };

    set((state) => ({ orders: [...state.orders, newOrder] }));
    get().save();
  },

  cancel: (id) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id && order.status === 'WORKING'
          ? { ...order, status: 'CANCELED' }
          : order,
      ),
    }));
    get().save();
  },

  match: () => {
    const last = get().last;
    if (last == null) {
      return;
    }

    const currentOrders = get().orders;
    const { orders: updatedOrders, fills } = matchOrders(currentOrders, last);

    if (fills.length === 0) {
      if (updatedOrders !== currentOrders) {
        set({ orders: updatedOrders });
      }
      return;
    }

    let account = get().account;
    for (const trade of fills) {
      account = applyTrade(account, trade);
    }

    const sortedFills = fills.slice().sort((a, b) => b.ts - a.ts);

    set((state) => ({
      orders: updatedOrders,
      account,
      trades: [...sortedFills, ...state.trades],
    }));
    get().save();
  },

  load: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      set((state) => ({
        ...state,
        ...createInitialState(),
        ...parsed,
      }));
    } catch (err) {
      console.error('failed to load state', err);
    }
  },

  save: () => {
    try {
      const { symbol, last, candles, account, orders, trades, oneShare } = get();
      const data = JSON.stringify({ symbol, last, candles, account, orders, trades, oneShare });
      localStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      console.error('failed to save state', err);
    }
  },

  toggleOneShare: () => {
    set((state) => ({ oneShare: !state.oneShare }));
    get().save();
  },
}));

export type { Side, OrderType, OrderStatus, Order, Trade, Account, Candle, Position } from './types';
