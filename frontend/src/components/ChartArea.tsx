import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';

export default function ChartArea() {
  const candles = useStore((state) => state.candles);
  const data = candles.map((candle) => ({
    t: new Date(candle.t).toLocaleTimeString('ja-JP', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }),
    c: candle.close,
  }));

  return (
    <div style={{ height: 360, border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="t" minTickGap={24} />
          <YAxis domain={['auto', 'auto']} width={60} />
          <Tooltip />
          <Line type="monotone" dataKey="c" dot={false} strokeWidth={2} stroke="#1976d2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
