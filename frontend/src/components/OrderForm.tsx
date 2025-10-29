import { useState } from 'react';
import { useStore, OrderType, Side } from '../store';
import { enforceLot, snapToJpTick } from '../marketJp';

export default function OrderForm() {
  const symbol = useStore((state) => state.symbol);
  const last = useStore((state) => state.last);
  const oneShare = useStore((state) => state.oneShare);
  const toggleOneShare = useStore((state) => state.toggleOneShare);
  const placeOrder = useStore((state) => state.placeOrder);
  const [type, setType] = useState<OrderType>('MARKET');
  const [side, setSide] = useState<Side>('BUY');
  const [qty, setQty] = useState(100);
  const [limit, setLimit] = useState<number | ''>('');

  const lotQty = enforceLot(qty, oneShare);
  const limitPreview = type === 'LIMIT' && typeof limit === 'number' ? snapToJpTick(limit) : undefined;

  function submit() {
    if (lotQty <= 0) {
      alert('数量が不正です');
      return;
    }
    if (type === 'LIMIT') {
      if (typeof limit !== 'number' || Number.isNaN(limit) || limit <= 0) {
        alert('指値価格が不正です');
        return;
      }
    }
    placeOrder({
      symbol,
      side,
      type,
      qty: lotQty,
      limitPrice: type === 'LIMIT' ? snapToJpTick(Number(limit)) : undefined,
    });
  }

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>注文</strong>（{symbol} / 現値: {last ?? '-'}）
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>
          種別：
          <select value={type} onChange={(event) => setType(event.target.value as OrderType)}>
            <option value="MARKET">成行</option>
            <option value="LIMIT">指値</option>
          </select>
        </label>
        <label>
          サイド：
          <select value={side} onChange={(event) => setSide(event.target.value as Side)}>
            <option value="BUY">買い</option>
            <option value="SELL">売り</option>
          </select>
        </label>
        <label>
          数量：
          <input type="number" value={qty} onChange={(event) => setQty(Number(event.target.value))} />
          <small>（{oneShare ? '1株単位' : '100株単位'} → 発注数量: {lotQty}）</small>
        </label>
        {type === 'LIMIT' && (
          <label>
            指値価格：
            <input
              type="number"
              value={limit}
              onChange={(event) => setLimit(event.target.value === '' ? '' : Number(event.target.value))}
            />
            {limitPreview !== undefined && <small>（呼値スナップ: {limitPreview}）</small>}
          </label>
        )}
        <div>
          <button type="button" onClick={submit}>
            {type === 'MARKET'
              ? side === 'BUY'
                ? '成行で買う'
                : '成行で売る'
              : side === 'BUY'
                ? '指値で買う'
                : '指値で売る'}
          </button>
          <label style={{ marginLeft: 12 }}>
            <input type="checkbox" checked={oneShare} onChange={toggleOneShare} /> 1株モード
          </label>
        </div>
      </div>
    </div>
  );
}
