import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store';
import { fetchPrice, fetchOhlc } from './api';
import { isWithinJpSession } from './marketJp';
import ChartArea from './components/ChartArea';
import OrderForm from './components/OrderForm';
import QuestBoard from './components/QuestBoard';
import Tables from './components/Tables';
import TickerSelect from './components/TickerSelect';

export default function App() {
  const symbol = useStore((state) => state.symbol);
  const setLast = useStore((state) => state.setLast);
  const setCandles = useStore((state) => state.setCandles);
  const match = useStore((state) => state.match);
  const load = useStore((state) => state.load);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ticker = setInterval(() => setClock(new Date()), 1_000);
    return () => clearInterval(ticker);
  }, []);

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

  const clockLabel = useMemo(
    () => clock.toLocaleString('ja-JP', { hour12: false }),
    [clock],
  );

  return (
    <div className="app-shell">
      <div className="glow-orb orb-pink" aria-hidden />
      <div className="glow-orb orb-blue" aria-hidden />
      <div className="game-frame">
        <div className="floating-mascot" aria-hidden>
          🦊
        </div>
        <Header error={errorBanner} clock={clockLabel} />
        <div className="main-grid">
          <div className="chart-card">
            <div className="card-content">
              <h3 className="card-title">
                <span role="img" aria-hidden>
                  🌈
                </span>
                キラキラチャート
              </h3>
              <ChartArea />
            </div>
          </div>
          <div className="aside-grid">
            <OrderForm />
            <QuestBoard />
          </div>
        </div>
        <Tables />
      </div>
    </div>
  );
}

type HeaderProps = {
  error: string | null;
  clock: string;
};

function Header({ error, clock }: HeaderProps) {
  const symbol = useStore((state) => state.symbol);
  const account = useStore((state) => state.account);
  const last = useStore((state) => state.last);
  const position = account.positions[symbol];
  const unrealized = position && last != null ? (last - position.avgPrice) * position.qty : 0;
  const totalScore = Math.max(0, Math.round(account.realizedPnL + Math.max(0, unrealized)));
  const step = 20000;
  const level = Math.min(99, Math.floor(totalScore / step) + 1);
  const progressRaw = totalScore % step;
  const progressPercent = Math.min(100, Math.round((progressRaw / step) * 100));
  const nextMilestone = step - progressRaw;
  const starCount = Math.min(5, Math.max(1, Math.floor(totalScore / (step / 2)) + 1));

  return (
    <header className="header-card">
      <div className="hero-panel">
        <div>
          <div className="logo-title">
            <span role="img" aria-hidden>
              🎮
            </span>
            トレード・クエスト
          </div>
          <span className="symbol-chip">
            <span role="img" aria-hidden>
              📊
            </span>
            {symbol}
          </span>
        </div>
        <TickerSelect />
      </div>
      <div className="level-panel">
        <h3>今日の冒険ランク</h3>
        <div className="level-score">
          <div className="level-badge">Lv.{level}</div>
          <div className="progress-track" aria-hidden>
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="level-metrics">
          <span className="badge info">⭐️ {starCount} スター</span>
          <span className="badge success">実現損益: ¥{Math.round(account.realizedPnL).toLocaleString('ja-JP')}</span>
          <span className="badge warn">次レベルまで: ¥{Math.max(0, nextMilestone).toLocaleString('ja-JP')}</span>
        </div>
      </div>
      <div className="header-status">
        <div className="clock-pill">⏰ {clock}</div>
        <div className="badge info">参考値（遅延あり）：Yahoo Finance</div>
        {error && (
          <div className="error-pill">
            <span role="img" aria-hidden>
              ⚠️
            </span>
            {error}
          </div>
        )}
      </div>
    </header>
  );
}
