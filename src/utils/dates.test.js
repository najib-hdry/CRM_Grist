import { describe, it, expect } from 'vitest';
import { daysFromNow, toEpoch, formatDate, epochToInputDate, addDaysToDateInput } from './dates.js';

describe('daysFromNow', () => {
  it('returns null for falsy epoch', () => {
    expect(daysFromNow(null)).toBeNull();
    expect(daysFromNow(0)).toBeNull();
  });

  it('returns a negative number for a past date', () => {
    var pastEpoch = Math.floor(Date.now() / 1000) - 10 * 86400;
    expect(daysFromNow(pastEpoch)).toBeLessThan(0);
  });

  it('returns a positive number for a future date', () => {
    var futureEpoch = Math.floor(Date.now() / 1000) + 5 * 86400;
    expect(daysFromNow(futureEpoch)).toBeGreaterThan(0);
  });
});

describe('toEpoch / epochToInputDate round-trip', () => {
  it('converts an input date string to epoch and back', () => {
    var epoch = toEpoch('2026-07-15');
    expect(epochToInputDate(epoch)).toBe('2026-07-15');
  });

  it('returns null for an empty string', () => {
    expect(toEpoch('')).toBeNull();
  });
});

describe('formatDate', () => {
  it('returns an empty string for a falsy epoch', () => {
    expect(formatDate(null)).toBe('');
  });
});

describe('addDaysToDateInput', () => {
  it('adds days across a month boundary', () => {
    expect(addDaysToDateInput('2026-07-30', 3)).toBe('2026-08-02');
  });

  it('adds days within the same month', () => {
    expect(addDaysToDateInput('2026-07-15', 7)).toBe('2026-07-22');
  });

  it('returns an empty string when no date is given', () => {
    expect(addDaysToDateInput('', 5)).toBe('');
  });
});
