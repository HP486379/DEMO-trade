import { useMemo, useState, type KeyboardEvent } from 'react';
import { useStore, type MarketSession } from '../store';
import { SYMBOL_DIRECTORY, findSymbolEntry, sanitise } from '../symbolDirectory';

const FEATURED_CODES = new Set([
  '7203.T',
  '6758.T',
  '9984.T',
  '8035.T',
  '9432.T',
  '7974.T',
  '9983.T',
  '8306.T',
]);

const FEATURED_SYMBOLS = SYMBOL_DIRECTORY.filter((entry) => FEATURED_CODES.has(entry.value));

type Suggestion = {
  value: string;
  label: string;
  description: string;
};

function normalizeSymbol(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const upper = trimmed.toUpperCase();
  if (upper.startsWith('^')) {
    return upper;
  }
  if (upper.includes('.')) {
    return upper;
  }
  return `${upper}.T`;
}

function buildSuggestion(entry: { value: string; name: string; englishName?: string }): Suggestion {
  return {
    value: entry.value,
    label: `${entry.name}`,
    description: entry.englishName ? `${entry.value} ｜ ${entry.englishName}` : entry.value,
  };
}

function createManualSuggestion(input: string): Suggestion | null {
  const symbol = normalizeSymbol(input);
  if (!symbol) {
    return null;
  }
  return {
    value: symbol,
    label: symbol,
    description: 'カスタム入力',
  };
}

function collectSuggestions(keyword: string): Suggestion[] {
  const prepared = sanitise(keyword);
  if (!prepared) {
    return [];
  }
  const matches = SYMBOL_DIRECTORY.filter((entry) => {
    const tokens = [entry.value, entry.name, entry.shortName, entry.englishName, ...(entry.aliases ?? [])].filter(
      (token): token is string => Boolean(token),
    );
    return tokens.some((token) => {
      const sanitisedToken = sanitise(token);
      return sanitisedToken.includes(prepared) || prepared.includes(sanitisedToken);
    });
  });
  return matches.slice(0, 8).map((entry) => buildSuggestion(entry));
}

export default function TickerSelect() {
  const symbol = useStore((state) => state.symbol);
  const setSymbol = useStore((state) => state.setSymbol);
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const featuredSymbols = useMemo(() => {
    return FEATURED_SYMBOLS.map((entry) => ({
      entry,
      isActive: entry.value === symbol,
    }));
  }, [symbol]);

  const suggestions = useMemo(() => {
    if (!input.trim()) {
      return [];
    }
    const directoryHit = collectSuggestions(input);
    if (directoryHit.length > 0) {
      return directoryHit;
    }
    const manual = createManualSuggestion(input);
    return manual ? [manual] : [];
  }, [input]);

  const applyManual = () => {
    if (!input.trim()) {
      return;
    }
    const preset = findSymbolEntry(input);
    if (preset) {
      setSymbol(preset.value);
      setInput('');
      return;
    }
    const manual = createManualSuggestion(input);
    if (!manual) {
      return;
    }
    setSymbol(manual.value);
    setInput('');
  };

  const onManualKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyManual();
    }
  };

  const switchSession = (next: MarketSession) => {
    if (next === session) return;
    setSession(next);
  };

  const activateSuggestion = (suggestion: Suggestion) => {
    setSymbol(suggestion.value);
    setInput('');
    setFocused(false);
  };

  return (
    <div className="ticker-panel">
      <div className="ticker-buttons" role="group" aria-label="人気の銘柄を選択">
        {featuredSymbols.map(({ entry, isActive }) => (
          <button
            key={entry.value}
            type="button"
            className={isActive ? 'ticker-chip active' : 'ticker-chip'}
            onClick={() => setSymbol(entry.value)}
          >
            {entry.name} {entry.englishName ? `(${entry.englishName})` : ''}
          </button>
        ))}
      </div>
      <div className="ticker-manual">
        <label className="ticker-label">
          <span role="img" aria-hidden>
            🔍
          </span>
          ティッカー or 銘柄名を入力
        </label>
        <div className="ticker-input-row">
          <input
            className="ticker-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onManualKey}
            placeholder="例: トヨタ / 任天堂 / 7203"
            aria-label="ティッカーや銘柄名"
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            autoComplete="off"
          />
          <button type="button" className="ticker-apply" onClick={applyManual}>
            変更！
          </button>
        </div>
        {focused && suggestions.length > 0 && (
          <ul className="ticker-suggestions" role="listbox">
            {suggestions.map((suggestion) => (
              <li key={suggestion.value}>
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => activateSuggestion(suggestion)}>
                  <span className="suggestion-label">{suggestion.label}</span>
                  <span className="suggestion-desc">{suggestion.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="ticker-hint">末尾に市場サフィックスが無い場合は .T を自動付与します。</p>
        <div className="session-toggle" role="group" aria-label="市場セッションを切り替え">
          <SessionButton label="東証（通常）" active={session === 'regular'} onClick={() => switchSession('regular')} />
          <SessionButton label="PTS（夜間）" active={session === 'pts'} onClick={() => switchSession('pts')} />
        </div>
        <p className="ticker-hint">PTS は夜間でも価格を追いかけます（Yahooの延長取引データ）。</p>
      </div>
    </div>
  );
}

type SessionButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function SessionButton({ label, active, onClick }: SessionButtonProps) {
  const className = active ? 'session-chip active' : 'session-chip';
  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
