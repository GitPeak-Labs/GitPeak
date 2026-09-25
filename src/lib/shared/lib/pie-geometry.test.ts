import { describe, expect, test } from 'bun:test'
import { buildPieSlices, generateArcPath, polarToCoordinates } from './pie-geometry'

describe('buildPieSlices', () => {
  test('returns an empty array for no input', () => {
    expect(buildPieSlices([])).toEqual([])
  })

  test('lays slices out clockwise from -90° with a gap between them', () => {
    const slices = buildPieSlices([
      { name: 'A', percentage: 50 },
      { name: 'B', percentage: 50 },
    ])

    expect(slices).toHaveLength(2)
    expect(slices[0].startAngleDegrees).toBeCloseTo(-89.1)
    expect(slices[0].endAngleDegrees).toBeCloseTo(89.1)
    expect(slices[1].startAngleDegrees).toBeCloseTo(90.9)
    expect(slices[0].midAngleDegrees).toBeCloseTo(0)
  })

  test('assigns a cycling accent colour per index', () => {
    const slices = buildPieSlices([
      { name: 'A', percentage: 34 },
      { name: 'B', percentage: 33 },
      { name: 'C', percentage: 33 },
    ])

    expect(new Set(slices.map((slice) => slice.color)).size).toBe(3)
  })
})

describe('polarToCoordinates', () => {
  test('maps 0° to the point directly right of centre', () => {
    const point = polarToCoordinates({ centerX: 100, centerY: 100, radius: 50, degrees: 0 })

    expect(point.positionX).toBeCloseTo(150)
    expect(point.positionY).toBeCloseTo(100)
  })
})

describe('generateArcPath', () => {
  test('produces a closed donut-segment path', () => {
    const path = generateArcPath({
      centerX: 100,
      centerY: 100,
      outerRadius: 90,
      innerRadius: 60,
      startAngle: -90,
      endAngle: 0,
    })

    expect(path.startsWith('M ')).toBe(true)
    expect(path.trimEnd().endsWith('Z')).toBe(true)
    expect(path).toContain('A 90 90')
    expect(path).toContain('A 60 60')
  })
})
