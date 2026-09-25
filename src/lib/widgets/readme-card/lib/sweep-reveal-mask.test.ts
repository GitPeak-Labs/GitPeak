import { describe, expect, test } from 'bun:test'
import {
  SWEEP_BEGIN_SECONDS,
  buildSweepRevealMask,
  sweepRevealDelaySeconds,
} from './sweep-reveal-mask'

const CIRCLE = { centerX: 100, centerY: 100, radius: 50 }

describe('buildSweepRevealMask', () => {
  test('pairs every path keyframe with a key time from 0 to 1', () => {
    const mask = buildSweepRevealMask(CIRCLE)
    const keyTimes = mask.keyTimes.split(';')

    expect(mask.pathKeyframes.split(';')).toHaveLength(keyTimes.length)
    expect(keyTimes[0]).toBe('0.0000')
    expect(keyTimes.at(-1)).toBe('1.0000')
  })

  test('ends on a full circle drawn as two half arcs', () => {
    const mask = buildSweepRevealMask(CIRCLE)

    expect(mask.finalPath).toBe('M 50 100 A 50 50 0 1 1 150 100 A 50 50 0 1 1 50 100 Z')
    expect(mask.pathKeyframes.endsWith(mask.finalPath)).toBe(true)
  })

  test('starts as an empty sector at twelve o’clock', () => {
    const firstKeyframe = buildSweepRevealMask(CIRCLE).pathKeyframes.split(';')[0]

    expect(firstKeyframe).toBe('M 100 100 L 100 50 A 50 50 0 0 1 100 50 Z')
  })
})

describe('sweepRevealDelaySeconds', () => {
  test('reveals the first slice as the sweep begins', () => {
    expect(sweepRevealDelaySeconds(-90)).toBe(SWEEP_BEGIN_SECONDS)
  })

  test('reveals later slices later', () => {
    expect(sweepRevealDelaySeconds(90)).toBeGreaterThan(sweepRevealDelaySeconds(0))
  })

  test('clamps angles outside the sweep', () => {
    expect(sweepRevealDelaySeconds(-180)).toBe(SWEEP_BEGIN_SECONDS)
    expect(sweepRevealDelaySeconds(400)).toBe(sweepRevealDelaySeconds(270))
  })
})
