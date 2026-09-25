import { expect, test, describe } from 'bun:test'
import { formatFullNumber, formatNumber } from './number-formatting'

describe('formatNumber', () => {
  test('returns numbers below 1000 exactly as strings', () => {
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(0)).toBe('0')
  })

  test("formats thousands with a 'k' suffix and trims trailing zeros", () => {
    expect(formatNumber(1000)).toBe('1k')
    expect(formatNumber(1500)).toBe('1.5k')
    expect(formatNumber(999900)).toBe('999.9k')
  })

  test("formats millions with an 'm' suffix and trims trailing zeros", () => {
    expect(formatNumber(1000000)).toBe('1m')
    expect(formatNumber(2500000)).toBe('2.5m')
  })
})

describe('formatFullNumber', () => {
  test('keeps every digit and groups thousands with commas', () => {
    expect(formatFullNumber(2305)).toBe('2,305')
    expect(formatFullNumber(270_721)).toBe('270,721')
    expect(formatFullNumber(1_234_567)).toBe('1,234,567')
  })

  test('leaves small numbers untouched', () => {
    expect(formatFullNumber(0)).toBe('0')
    expect(formatFullNumber(67)).toBe('67')
  })
})
