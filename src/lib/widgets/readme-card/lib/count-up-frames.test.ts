import { describe, expect, test } from 'bun:test'
import { buildCountUpFrames } from './count-up-frames'

const BEGIN_SECONDS = 0.4

describe('buildCountUpFrames', () => {
  test('counts from zero up to the full final number', () => {
    const frames = buildCountUpFrames({ finalCount: 270_700, beginSeconds: BEGIN_SECONDS })

    expect(frames[0].label).toBe('0')
    expect(frames.at(-1)?.label).toBe('270,700')
  })

  test('shows zero until the count begins and keeps the final number up for good', () => {
    const frames = buildCountUpFrames({ finalCount: 2300, beginSeconds: BEGIN_SECONDS })

    expect(frames[0].showFromSeconds).toBe(0)
    expect(frames[0].hideAtSeconds).toBeGreaterThan(BEGIN_SECONDS)
    expect(frames.at(-1)?.hideAtSeconds).toBeNull()
  })

  test('hands over from each frame to the next with no gap or overlap', () => {
    const frames = buildCountUpFrames({ finalCount: 2300, beginSeconds: BEGIN_SECONDS })

    frames.slice(1).forEach((frame, index) => {
      const hideAtSeconds = frames[index].hideAtSeconds
      if (hideAtSeconds === null) throw new Error('Expected hideAtSeconds to be set')

      expect(frame.showFromSeconds).toBe(hideAtSeconds)
    })
  })

  test('merges repeated labels so small numbers tick once per value', () => {
    const labels = buildCountUpFrames({ finalCount: 3, beginSeconds: BEGIN_SECONDS }).map(
      (frame) => frame.label,
    )

    expect(labels).toEqual(['0', '1', '2', '3'])
  })

  test('shows a single frame for zero', () => {
    expect(buildCountUpFrames({ finalCount: 0, beginSeconds: BEGIN_SECONDS })).toEqual([
      { label: '0', showFromSeconds: 0, hideAtSeconds: null },
    ])
  })
})
