import { describe, expect, test } from 'bun:test'
import { fitDisplayName, serifTextWidth } from './display-name'

const FONT_SIZE = 100
const FLOAT_PRECISION_DIGITS = 6

describe('serifTextWidth', () => {
  test('matches the measured Instrument Serif widths for digits and separators', () => {
    expect(serifTextWidth('2,305', FONT_SIZE)).toBeCloseTo(178, FLOAT_PRECISION_DIGITS)
  })

  test('makes capitals wider than lowercase letters', () => {
    expect(serifTextWidth('A', FONT_SIZE)).toBeGreaterThan(serifTextWidth('a', FONT_SIZE))
  })

  test('counts CJK glyphs at a full em', () => {
    expect(serifTextWidth('雨音', FONT_SIZE)).toBe(200)
  })
})

describe('fitDisplayName', () => {
  test('keeps a name that fits', () => {
    expect(fitDisplayName('Linus Torvalds', 12)).toBe('Linus Torvalds')
  })

  test('cuts a long latin name with an ellipsis inside the budget', () => {
    const fitted = fitDisplayName('Maximilian Alexander Bartholomew', 8)

    expect(fitted.endsWith('…')).toBe(true)
    expect(serifTextWidth(fitted, 1)).toBeLessThanOrEqual(8)
  })

  test('counts CJK characters much wider than latin ones', () => {
    expect(fitDisplayName('雨音カイ雨音カイ雨音カイ', 5)).toBe('雨音カイ…')
    expect(fitDisplayName('Amane Kai / 雨音カイ', 12)).toBe('Amane Kai / 雨音カイ')
  })

  test('drops trailing spaces before the ellipsis', () => {
    expect(fitDisplayName('Octo Catalog', 2.2)).toBe('Octo…')
  })
})
