import { useStore } from '../store';
import { yen } from '../marketJp';

export default function Tables() {
  const account = useStore((state) => state.account);
  const orders = useStore((state) => state.orders);
  const trades = useStore((state) => state.trades);
  const last = useStore((state) => state.last);
  const symbol = useStore((state) => state.symbol);
  const position = account.positions[symbol];
  const unrealized = position && last != null ? (last - position.avgPrice) * position.qty : 0;
  const equity = account.cash + (position ? unrealized : 0);

  return (
    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h4>口座</h4>
        <div>
          現金: <strong>{yen(account.cash)}</strong>
        </div>
        <div>
          実現損益: <strong>{yen(account.realizedPnL)}</strong>
        </div>
        <div>
          評価損益: <strong>{yen(unrealized)}</strong>
        </div>
        <div>
          評価額: <strong>{yen(equity)}</strong>
        </div>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h4>ポジション</h4>
        {position ? (
          <div>
            {symbol} / {position.qty} 株 @ {position.avgPrice.toFixed(1)}
          </div>
        ) : (
          <div>なし</div>
        )}
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h4>注文（最新順）</h4>
        <table width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>種別</th>
              <th>Side</th>
              <th>価格</th>
              <th>数量</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody>
            {[...orders].reverse().map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.type}</td>
                <td>{order.side}</td>
                <td>{order.limitPrice ?? '-'}</td>
                <td>{order.qty}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h4>約定履歴（最新順）</h4>
        <table width="100%">
          <thead>
            <tr>
              <th>時刻</th>
              <th>Side</th>
              <th>価格</th>
              <th>数量</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.orderId}>
                <td>{new Date(trade.ts).toLocaleTimeString('ja-JP', { hour12: false })}</td>
                <td>{trade.side}</td>
                <td>{trade.price}</td>
                <td>{trade.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
