import { describe, expect, test } from 'bun:test'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import { buildThemedSlices, groupSlicesForLegend, legendRowsFor } from './language-slices'

const THEME = PRESET_THEMES['Rosé Pine']
const REMAINDER_COLOR = '#6e6a86'

function languagesWithShares(percentages: number[]): { name: string; percentage: number }[] {
  return percentages.map((percentage, index) => ({ name: `Language ${index}`, percentage }))
}

describe('buildThemedSlices', () => {
  test('colors slices from the theme accents in a fixed order', () => {
    const slices = buildThemedSlices(languagesWithShares([60, 40]), THEME)

    expect(slices.map((slice) => slice.color)).toEqual([THEME.love, THEME.gold])
  })
})

describe('groupSlicesForLegend', () => {
  test('keeps slices above the threshold and folds the rest together', () => {
    const slices = buildThemedSlices(languagesWithShares([70, 25, 3, 2]), THEME)
    const grouping = groupSlicesForLegend(slices, 3, 2)

    expect(grouping.displayed.map((slice) => slice.percentage)).toEqual([70, 25])
    expect(grouping.otherCount).toBe(2)
    expect(grouping.otherPercent).toBe(5)
  })
})

describe('legendRowsFor', () => {
  test('lists named languages then one remainder row', () => {
    const slices = buildThemedSlices(languagesWithShares([70, 25, 3, 2]), THEME)
    const rows = legendRowsFor(groupSlicesForLegend(slices, 3, 2), REMAINDER_COLOR)

    expect(rows.at(-1)).toEqual({
      name: '+2 more',
      percentage: 5,
      color: REMAINDER_COLOR,
      isFoldedRemainder: true,
    })
    expect(rows.filter((row) => row.isFoldedRemainder)).toHaveLength(1)
  })

  test('adds no remainder row when every language is named', () => {
    const slices = buildThemedSlices(languagesWithShares([60, 40]), THEME)
    const rows = legendRowsFor(groupSlicesForLegend(slices), REMAINDER_COLOR)

    expect(rows.every((row) => !row.isFoldedRemainder)).toBe(true)
  })
})
