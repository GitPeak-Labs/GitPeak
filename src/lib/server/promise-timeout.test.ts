import { describe, expect, test } from 'bun:test'
import { withTimeout } from './promise-timeout'

describe('withTimeout', () => {
  test('returns a result that settles within the deadline', async () => {
    await expect(withTimeout(Promise.resolve('ready'), 100, 'timed out')).resolves.toBe('ready')
  })

  test('rejects work that exceeds the deadline', async () => {
    const pending = new Promise<never>(() => undefined)

    await expect(withTimeout(pending, 5, 'timed out')).rejects.toThrow('timed out')
  })
})
