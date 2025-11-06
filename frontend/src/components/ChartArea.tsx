import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store';

export default function ChartArea() {
  const candles = useStore((state) => state.candles);
  const last = useStore((state) => state.last);
  const symbol = useStore((state) => state.symbol);

  const chartData = candles.map((candle) => ({
    t: new Date(candle.t).toLocaleTimeString('ja-JP', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }),
    c: candle.close,
  }));

  const firstValue = chartData.length > 0 ? chartData[0].c : null;
  const diff = last != null && firstValue != null ? last - firstValue : null;
  const diffPct = diff != null && firstValue ? (diff / firstValue) * 100 : null;
  const trendBadgeClass = diff == null ? 'badge info' : diff >= 0 ? 'badge success' : 'badge danger';
  const trendLabel =
    diff == null
      ? 'データ待機中'
      : `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} / ${(diffPct ?? 0).toFixed(2)}%`;

  return (
    <>
      <div className="chart-meta">
        <div className="badge info">{symbol} ライブチャート</div>
        <div className={trendBadgeClass}>{trendLabel}</div>
      </div>
      <div className="chart-wrapper">
        {chartData.length === 0 ? (
          <div className="chart-empty">データが集まるのを待っています…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#f0f0ff" strokeDasharray="4 8" />
              <XAxis dataKey="t" minTickGap={24} stroke="#918bd6" tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} width={60} stroke="#918bd6" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid rgba(95, 139, 255, 0.3)',
                  boxShadow: '0 12px 24px rgba(95, 139, 255, 0.2)',
                }}
              />
              <Line type="monotone" dataKey="c" dot={false} strokeWidth={3} stroke="#ff7dcb" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
