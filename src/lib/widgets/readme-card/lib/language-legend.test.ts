import { describe, expect, test } from 'bun:test'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import {
  LEGEND_FONT_SIZE,
  LEGEND_WRAP_LINE_HEIGHT,
  buildReadmeLegend,
  layoutLegendRows,
  type LegendRow,
} from './language-legend'

const THEME = PRESET_THEMES['Rosé Pine']
const FLOAT_TOLERANCE = 1e-9

function languagesWithShares(percentages: number[]): { name: string; percentage: number }[] {
  return percentages.map((percentage, index) => ({ name: `Language ${index}`, percentage }))
}

function legendRow(name: string): LegendRow {
  return { name, percentLabel: '10%', color: '#ffffff', isFoldedRemainder: false }
}

describe('buildReadmeLegend', () => {
  test('names the top seven languages and folds the rest into one row', () => {
    const legend = buildReadmeLegend(languagesWithShares([30, 20, 12, 10, 8, 6, 5, 4, 3, 2]), THEME)

    expect(legend.rows).toHaveLength(8)
    expect(legend.rows.at(-1)).toMatchObject({
      name: '+3 more',
      percentLabel: '9%',
      color: THEME.muted,
      isFoldedRemainder: true,
    })
  })

  test('adds no remainder row when every language is named', () => {
    const legend = buildReadmeLegend(languagesWithShares([60, 40]), THEME)

    expect(legend.rows.map((row) => row.name)).toEqual(['Language 0', 'Language 1'])
  })

  test('dims the seventh language so it never matches the first', () => {
    const legend = buildReadmeLegend(languagesWithShares([30, 20, 15, 12, 10, 8, 5]), THEME)

    expect(legend.slices[0].color).toBe(THEME.love)
    expect(legend.slices[6].color).not.toBe(legend.slices[0].color)
    expect(legend.slices[6].color).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('layoutLegendRows', () => {
  const layout = { legendWidth: 168, centerY: 200, maxSpan: 244, scale: 1 }

  test('wraps a long name onto a second line instead of cutting it', () => {
    const [row] = layoutLegendRows({ ...layout, rows: [legendRow('Jupyter Notebook Extended')] })

    expect(row.nameLines).toEqual(['Jupyter Notebook', 'Extended'])
  })

  test('pushes the row after a wrapped name down by the extra line', () => {
    const rows = layoutLegendRows({
      ...layout,
      rows: [legendRow('Jupyter Notebook Extended'), legendRow('C'), legendRow('Go')],
    })
    const firstGap = rows[1].baselineY - rows[0].baselineY
    const secondGap = rows[2].baselineY - rows[1].baselineY

    expect(firstGap - secondGap).toBeCloseTo(LEGEND_WRAP_LINE_HEIGHT, 6)
  })

  test('keeps a full legend within the allowed span', () => {
    const rows = layoutLegendRows({
      ...layout,
      rows: Array.from({ length: 12 }, (_, index) => legendRow(`L${index}`)),
    })

    expect(rows[rows.length - 1].baselineY - rows[0].baselineY).toBeLessThanOrEqual(
      layout.maxSpan + FLOAT_TOLERANCE,
    )
  })

  test('returns nothing for an empty legend', () => {
    expect(layoutLegendRows({ ...layout, rows: [] })).toEqual([])
  })

  test('scales the legend typography up with the given scale factor', () => {
    const [row] = layoutLegendRows({ ...layout, rows: [legendRow('Go')], scale: 1.5 })

    expect(row.fontSize).toBeCloseTo(LEGEND_FONT_SIZE * 1.5, 6)
  })
})
