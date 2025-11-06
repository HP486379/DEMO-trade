import { useMemo } from 'react';
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

  const latestOrders = useMemo(() => [...orders].reverse(), [orders]);

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <h4>
          <span role="img" aria-hidden>
            💰
          </span>
          ぼうけんバッグ
        </h4>
        <div className="stats-row">
          <span>現金</span>
          <span className="stats-highlight">{yen(account.cash)}</span>
        </div>
        <div className="stats-row">
          <span>実現損益</span>
          <span className={account.realizedPnL >= 0 ? 'badge success' : 'badge danger'}>
            {yen(account.realizedPnL)}
          </span>
        </div>
        <div className="stats-row">
          <span>評価損益</span>
          <span className={unrealized >= 0 ? 'badge success' : 'badge danger'}>{yen(unrealized)}</span>
        </div>
        <div className="stats-row">
          <span>評価額</span>
          <span className="stats-highlight">{yen(equity)}</span>
        </div>
      </div>

      <div className="stats-card">
        <h4>
          <span role="img" aria-hidden>
            📦
          </span>
          ポジション図鑑
        </h4>
        {position ? (
          <>
            <div className="stats-row">
              <span>銘柄</span>
              <span className="badge info">{symbol}</span>
            </div>
            <div className="stats-row">
              <span>株数</span>
              <span className="badge success">{position.qty.toLocaleString('ja-JP')} 株</span>
            </div>
            <div className="stats-row">
              <span>平均価格</span>
              <span>{position.avgPrice.toFixed(1)} 円</span>
            </div>
          </>
        ) : (
          <p className="card-subtitle">まだポジションはありません。最初の冒険に出発しよう！</p>
        )}
      </div>

      <div className="card">
        <div className="card-content">
          <h3 className="card-title">
            <span role="img" aria-hidden>
              📝
            </span>
            注文ログ
          </h3>
          <div className="table-wrapper">
            <table>
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
                {latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6}>まだ注文はありません。コントローラーで挑戦しよう！</td>
                  </tr>
                ) : (
                  latestOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.type === 'MARKET' ? '成行' : '指値'}</td>
                      <td>
                        <span className={order.side === 'BUY' ? 'badge success' : 'badge danger'}>{order.side}</span>
                      </td>
                      <td>{order.limitPrice ?? '-'}</td>
                      <td>{order.qty.toLocaleString('ja-JP')}</td>
                      <td>
                        <span
                          className={
                            order.status === 'FILLED'
                              ? 'badge success'
                              : order.status === 'WORKING'
                              ? 'badge info'
                              : 'badge warn'
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h3 className="card-title">
            <span role="img" aria-hidden>
              ⚡
            </span>
            約定ヒーロー図鑑
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>時刻</th>
                  <th>Side</th>
                  <th>価格</th>
                  <th>数量</th>
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={4}>まだ約定はありません。冒険を進めてヒーローを増やそう！</td>
                  </tr>
                ) : (
                  trades.map((trade) => (
                    <tr key={trade.orderId}>
                      <td>{new Date(trade.ts).toLocaleTimeString('ja-JP', { hour12: false })}</td>
                      <td>
                        <span className={trade.side === 'BUY' ? 'badge success' : 'badge danger'}>{trade.side}</span>
                      </td>
                      <td>{trade.price}</td>
                      <td>{trade.qty.toLocaleString('ja-JP')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
