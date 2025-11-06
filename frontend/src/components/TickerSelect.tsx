import { useMemo, useState, type KeyboardEvent } from 'react';
import { useStore } from '../store';

const POPULAR_SYMBOLS = [
  { value: '7203.T', label: 'トヨタ 🚗' },
  { value: '6758.T', label: 'ソニー 🎧' },
  { value: '9432.T', label: 'NTT 📞' },
  { value: '9984.T', label: 'ソフトバンクG 🛰️' },
  { value: '8035.T', label: '東エレ 🧪' },
] as const;

function normalizeSymbol(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('^')) {
    return trimmed;
  }
  return /\.T$/.test(trimmed) ? trimmed : `${trimmed}.T`;
}

export default function TickerSelect() {
  const symbol = useStore((state) => state.symbol);
  const setSymbol = useStore((state) => state.setSymbol);
  const [input, setInput] = useState('');

  const groupedSymbols = useMemo(() => {
    return POPULAR_SYMBOLS.map((entry) => ({
      ...entry,
      isActive: entry.value === symbol,
    }));
  }, [symbol]);

  const applyManual = () => {
    const next = normalizeSymbol(input);
    if (!next) {
      return;
    }
    setSymbol(next);
    setInput('');
  };

  const onManualKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyManual();
    }
  };

  return (
    <div className="ticker-panel">
      <div className="ticker-buttons" role="group" aria-label="人気の銘柄を選択">
        {groupedSymbols.map((item) => (
          <button
            key={item.value}
            type="button"
            className={item.isActive ? 'ticker-chip active' : 'ticker-chip'}
            onClick={() => setSymbol(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="ticker-manual">
        <label className="ticker-label">
          <span role="img" aria-hidden>
            🔍
          </span>
          好きなティッカーを入力
        </label>
        <div className="ticker-input-row">
          <input
            className="ticker-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onManualKey}
            placeholder="例: 7203 または 7203.T"
            aria-label="ティッカーコード"
          />
          <button type="button" className="ticker-apply" onClick={applyManual}>
            変更！
          </button>
        </div>
        <p className="ticker-hint">末尾に .T が無い場合は自動で付与します。</p>
      </div>
    </div>
  );
}
