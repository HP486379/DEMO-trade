import { useEffect, useState } from 'react';
import { useStore } from './store';
import { fetchPrice, fetchOhlc } from './api';
import { isWithinJpSession } from './marketJp';
import ChartArea from './components/ChartArea';
import OrderForm from './components/OrderForm';
import Tables from './components/Tables';

export default function App() {
  const symbol = useStore((state) => state.symbol);
  const setLast = useStore((state) => state.setLast);
  const setCandles = useStore((state) => state.setCandles);
  const match = useStore((state) => state.match);
  const load = useStore((state) => state.load);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      if (cancelled) return;
      try {
        if (isWithinJpSession(new Date())) {
          const price = await fetchPrice(symbol);
          setLast(price.last ?? null);
          match();
        }
        const ohlc = await fetchOhlc(symbol, '5m', '1d');
        setCandles(ohlc.candles);
        setErrorBanner(null);
      } catch (err) {
        console.error(err);
        setErrorBanner('価格取得に失敗。再試行中…');
      }
      if (!cancelled) {
        timer = setTimeout(tick, 10_000);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [match, setCandles, setLast, symbol]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <Header error={errorBanner} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ChartArea />
        <OrderForm />
      </div>
      <Tables />
    </div>
  );
}

function Header({ error }: { error: string | null }) {
  const symbol = useStore((state) => state.symbol);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <div>
        <strong>{symbol}</strong>｜<span>参考値（遅延あり）：Yahoo Finance</span>
      </div>
      <div>{new Date().toLocaleString('ja-JP', { hour12: false })}</div>
      {error && (
        <div style={{ background: '#FFEB3B', padding: '2px 8px', borderRadius: 4 }}>{error}</div>
      )}
    </div>
  );
}
