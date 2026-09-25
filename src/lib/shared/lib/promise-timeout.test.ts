import { describe, expect, test } from 'bun:test'
import { withTimeout } from './promise-timeout'

describe('withTimeout', () => {
  test('returns a result that settles within the deadline', () => {
    expect(withTimeout(Promise.resolve('ready'), 100, 'timed out')).resolves.toBe('ready')
  })

  test('rejects work that exceeds the deadline', () => {
    const pending = new Promise<never>(() => undefined)

    expect(withTimeout(pending, 5, 'timed out')).rejects.toThrow('timed out')
  })
})
