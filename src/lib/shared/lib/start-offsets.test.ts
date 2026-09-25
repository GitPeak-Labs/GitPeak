import { describe, expect, test } from 'bun:test'
import { startOffsets } from './start-offsets'

describe('startOffsets', () => {
  test('starts each entry where the previous one ends', () => {
    expect(startOffsets([10, 20, 5])).toEqual([0, 10, 30])
  })

  test('returns nothing for nothing', () => {
    expect(startOffsets([])).toEqual([])
  })
})
