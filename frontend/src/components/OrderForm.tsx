import { FormEvent, useState } from 'react';
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

  function submit(event?: FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }
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
    <div className="card">
      <div className="card-content">
        <h3 className="card-title">
          <span role="img" aria-hidden>
            🕹️
          </span>
          トレードコントローラー
        </h3>
        <p className="card-subtitle">
          カラフルなボタンで気軽にトレード！モードを切り替えて自分だけの作戦を考えてみよう。
        </p>
        <div className="badge info">{symbol} の現値: {last ?? '-'} / ロット: {lotQty}</div>
        <form className="order-form" onSubmit={submit}>
          <label>
            種別をえらぶ
            <select value={type} onChange={(event) => setType(event.target.value as OrderType)}>
              <option value="MARKET">⚡ 成行（すぐ！）</option>
              <option value="LIMIT">🎯 指値（ねらい撃ち）</option>
            </select>
          </label>
          <label>
            サイドをえらぶ
            <select value={side} onChange={(event) => setSide(event.target.value as Side)}>
              <option value="BUY">🟢 買い</option>
              <option value="SELL">🔴 売り</option>
            </select>
          </label>
          <label>
            数量（株）
            <input
              type="number"
              value={qty}
              min={0}
              onChange={(event) => setQty(Number(event.target.value))}
            />
            <small>{oneShare ? '1株単位で冒険中！' : '100株単位で豪快に！'} → 発注数量: {lotQty}</small>
          </label>
          {type === 'LIMIT' && (
            <label>
              指値価格（円）
              <input
                type="number"
                value={limit}
                min={0}
                onChange={(event) => setLimit(event.target.value === '' ? '' : Number(event.target.value))}
              />
              {limitPreview !== undefined && (
                <span className="badge info">呼値スナップ: {limitPreview}</span>
              )}
            </label>
          )}
          <div className="order-primary">
            <button className="order-button" type="submit">
              {type === 'MARKET'
                ? side === 'BUY'
                  ? '🚀 成行で買う'
                  : '🌪️ 成行で売る'
                : side === 'BUY'
                  ? '🎯 指値で買う'
                  : '🎯 指値で売る'}
            </button>
            <label className="toggle-chip">
              <input type="checkbox" checked={oneShare} onChange={toggleOneShare} /> 1株モード
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
