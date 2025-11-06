import { describe, expect, it } from 'vitest';
import { enforceLot, isWithinJpSession, snapToJpTick } from './marketJp';

const at = (hour: number, minute: number) => {
  const date = new Date(0);
  date.setHours(hour, minute, 0, 0);
  return date;
};

describe('marketJp utilities', () => {
  it('detects trading sessions correctly', () => {
    expect(isWithinJpSession(at(9, 15))).toBe(true);
    expect(isWithinJpSession(at(11, 45))).toBe(false);
    expect(isWithinJpSession(at(12, 45))).toBe(true);
    expect(isWithinJpSession(at(15, 30))).toBe(false);
  });

  it('snaps price to JP ticks', () => {
    expect(snapToJpTick(999.74)).toBe(999.7);
    expect(snapToJpTick(1000.49)).toBe(1000);
    expect(snapToJpTick(5001)).toBe(5000);
    expect(snapToJpTick(29999)).toBe(30000);
  });

  it('enforces lots depending on mode', () => {
    expect(enforceLot(257)).toBe(200);
    expect(enforceLot(257, true)).toBe(257);
    expect(enforceLot(50)).toBe(0);
  });
});
