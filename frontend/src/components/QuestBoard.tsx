import { useMemo } from 'react';
import { useStore } from '../store';

export default function QuestBoard() {
  const orders = useStore((state) => state.orders);
  const trades = useStore((state) => state.trades);
  const realized = useStore((state) => state.account.realizedPnL);

  const questStates = useMemo(() => {
    const totalQty = trades.reduce((sum, trade) => sum + trade.qty, 0);
    const limitUsed = orders.some((order) => order.type === 'LIMIT');

    return [
      {
        icon: '🪙',
        title: 'はじめてのトレード！',
        description: '成行でも指値でもOK、まずはボタンを押して冒険を始めよう。',
        done: orders.length > 0,
        progress: `${orders.length} / 1`,
      },
      {
        icon: '🎯',
        title: 'スナイパー指値チャレンジ',
        description: '指値注文でピタッと価格を狙い撃ち！呼値スナップもチェックしよう。',
        done: limitUsed,
        progress: limitUsed ? '1 / 1' : '0 / 1',
      },
      {
        icon: '🚀',
        title: '1000株バトル',
        description: '累計で1000株をトレードするとバッジが光るよ。',
        done: totalQty >= 1000,
        progress: `${Math.min(totalQty, 1000).toLocaleString('ja-JP')} / 1,000`,
      },
      {
        icon: '💎',
        title: 'キラキラ利益コレクター',
        description: '実現損益でプラスになったら特別バッジゲット！',
        done: realized > 0,
        progress: realized > 0 ? 'CLEAR!' : 'あと少し…',
      },
      {
        icon: '⚡',
        title: 'スピードフィニッシュ',
        description: '約定履歴を増やして経験値をゲット。3件集めてコンボ達成！',
        done: trades.length >= 3,
        progress: `${Math.min(trades.length, 3)} / 3`,
      },
    ];
  }, [orders, trades, realized]);

  return (
    <div className="card">
      <div className="card-content">
        <h3 className="card-title">
          <span role="img" aria-hidden>
            🎯
          </span>
          今日のクエスト
        </h3>
        <div className="quest-board">
          {questStates.map((quest) => (
            <div className="quest-item" key={quest.title}>
              <div className="quest-icon" aria-hidden>
                {quest.icon}
              </div>
              <div>
                <h5>{quest.title}</h5>
                <p>{quest.description}</p>
              </div>
              <div className={`quest-badge${quest.done ? ' is-done' : ''}`}>
                {quest.done ? 'CLEAR!' : quest.progress}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
