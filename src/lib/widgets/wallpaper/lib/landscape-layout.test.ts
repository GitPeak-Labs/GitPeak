import { describe, expect, test } from 'bun:test'
import type { LegendRow } from '$lib/entities/github-stats/model/language-slices'
import { layoutLandscape, placeLandscapeLegend, placeLandscapeStats } from './landscape-layout'

const DESKTOP = { width: 1920, height: 1080, scaleUnit: 10.8 }

function legendRow(name: string): LegendRow {
  return { name, percentage: 20, color: '#ffffff', isFoldedRemainder: false }
}

describe('layoutLandscape', () => {
  const layout = layoutLandscape(DESKTOP)

  test('puts the stats column left of the divider and the donut right of it', () => {
    expect(layout.contentX + layout.leftColumnWidth).toBeLessThan(layout.dividerX)
    expect(layout.donutCenterX - layout.outerRadius).toBeGreaterThan(layout.dividerX)
  })

  test('centers the donut vertically in the body below the rule', () => {
    expect(layout.bodyTop).toBeGreaterThan(layout.ruleY)
    expect(layout.donutCenterY).toBeCloseTo((layout.bodyTop + layout.bodyBottom) / 2, 6)
  })

  test('keeps the legend inside the canvas', () => {
    expect(layout.legendX + layout.legendWidth).toBeLessThan(DESKTOP.width)
  })
})

describe('placeLandscapeLegend', () => {
  const layout = layoutLandscape(DESKTOP)

  test('centers the legend on the donut', () => {
    const legend = placeLandscapeLegend(
      ['Rust', 'C', 'Python'].map(legendRow),
      layout,
      DESKTOP.scaleUnit,
    )
    const middleRow = legend.rows[1]

    expect(middleRow.baselineY).toBeCloseTo(layout.donutCenterY, 6)
  })

  test('wraps a long name and pushes the next row down by the extra line', () => {
    const legend = placeLandscapeLegend(
      ['Jupyter Notebook Extended Edition', 'C', 'Go'].map(legendRow),
      layout,
      DESKTOP.scaleUnit,
    )
    const [wrapped, second, third] = legend.rows

    expect(wrapped.nameLines.length).toBeGreaterThan(1)
    expect(second.baselineY - wrapped.baselineY).toBeGreaterThan(third.baselineY - second.baselineY)
  })
})

describe('placeLandscapeStats', () => {
  test('lays the stats out two per row in the left column', () => {
    const layout = layoutLandscape(DESKTOP)
    const stats = placeLandscapeStats(['a', 'b', 'c'], layout, DESKTOP.scaleUnit)

    expect(stats[0].labelY).toBe(stats[1].labelY)
    expect(stats[2].x).toBe(stats[0].x)
    expect(stats[1].x).toBeLessThan(layout.dividerX)
    expect(stats[0].valueY).toBeGreaterThan(stats[0].labelY)
  })
})
