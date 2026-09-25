import { describe, expect, test } from 'bun:test'
import type { LegendRow } from '$lib/entities/github-stats/model/language-slices'
import { layoutPortrait, placePortraitLegendRows, placePortraitStats } from './portrait-layout'

const PHONE = { width: 1080, height: 1920, scaleUnit: 10.8 }
const TALL_PHONE = { width: 1080, height: 2520, scaleUnit: 10.8 }

function legendRow(name: string): LegendRow {
  return { name, percentage: 20, color: '#ffffff', isFoldedRemainder: false }
}

describe('layoutPortrait', () => {
  const layout = layoutPortrait({ ...PHONE, legendRowCount: 8, hasTopRepo: true })

  test('stacks brand, name, handle, donut, legend, top repo and stats top to bottom', () => {
    const order = [
      layout.brandBaselineY,
      layout.nameBaselineY,
      layout.handleBaselineY,
      layout.donutCenterY,
      layout.legendStartY,
      layout.topRepoValueY,
      layout.statGridY,
    ]

    expect(order).toEqual([...order].sort((first, second) => first - second))
  })

  test('keeps the whole stack clear of the status bar and home indicator', () => {
    expect(layout.brandBaselineY).toBeGreaterThan(PHONE.scaleUnit * 9)
    expect(layout.statGridY).toBeLessThan(PHONE.height - PHONE.scaleUnit * 6)
  })

  test('spreads the same content across a taller screen instead of leaving a gap', () => {
    const tallLayout = layoutPortrait({ ...TALL_PHONE, legendRowCount: 8, hasTopRepo: true })

    expect(tallLayout.statGridY - tallLayout.donutCenterY).toBeGreaterThan(
      layout.statGridY - layout.donutCenterY,
    )
  })

  test('pulls the stats up when there is no top repository to show', () => {
    const withoutRepo = layoutPortrait({ ...PHONE, legendRowCount: 8, hasTopRepo: false })

    expect(withoutRepo.statGridY - withoutRepo.legendStartY).toBeLessThan(
      layout.statGridY - layout.legendStartY,
    )
  })
})

describe('placePortraitLegendRows', () => {
  test('lays the legend out in two columns', () => {
    const layout = layoutPortrait({ ...PHONE, legendRowCount: 4, hasTopRepo: false })
    const rows = placePortraitLegendRows(
      ['Rust', 'C', 'Python', 'Go'].map(legendRow),
      layout,
      PHONE.scaleUnit,
    )

    expect(rows[0].baselineY).toBe(rows[1].baselineY)
    expect(rows[1].dotX).toBeGreaterThan(rows[0].dotX)
    expect(rows[2].baselineY).toBeGreaterThan(rows[0].baselineY)
  })
})

describe('placePortraitStats', () => {
  test('lays the stats out in three centered columns', () => {
    const layout = layoutPortrait({ ...PHONE, legendRowCount: 4, hasTopRepo: false })
    const stats = placePortraitStats(['a', 'b', 'c', 'd'], layout, PHONE.scaleUnit)

    expect(stats[1].centerX).toBeCloseTo(layout.centerX, 6)
    expect(stats[3].centerX).toBe(stats[0].centerX)
    expect(stats[3].valueY).toBeGreaterThan(stats[0].valueY)
  })
})
