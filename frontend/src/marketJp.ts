export const JP_TRADING_SESSIONS = [
  { start: '09:00', end: '11:30' },
  { start: '12:30', end: '15:30' },
];

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isWithinJpSession(date: Date = new Date()): boolean {
  const now = date.getHours() * 60 + date.getMinutes();
  return JP_TRADING_SESSIONS.some((session) => {
    const start = toMinutes(session.start);
    const end = toMinutes(session.end);
    return now >= start && now < end;
  });
}

export function snapToJpTick(price: number): number {
  const abs = Math.abs(price);
  let tick = 0.1;
  if (abs >= 1000 && abs < 5000) tick = 1;
  else if (abs >= 5000 && abs < 30000) tick = 5;
  else if (abs >= 30000) tick = 10;
  const snapped = Math.round(price / tick) * tick;
  return Number(snapped.toFixed(tick >= 1 ? 0 : 1));
}

export function enforceLot(quantity: number, oneShareMode = false): number {
  const lot = oneShareMode ? 1 : 100;
  return Math.max(0, Math.floor(quantity / lot) * lot);
}

export const yen = (value: number) => `¥${Math.round(value).toLocaleString('ja-JP')}`;
