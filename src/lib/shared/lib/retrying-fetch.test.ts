import { describe, expect, test } from 'bun:test'
import { requestWithRetries } from './retrying-fetch'

const immediate = { attempts: 3, delayMilliseconds: 0 }

describe('requestWithRetries', () => {
  test('returns the first successful response without further attempts', async () => {
    let calls = 0
    const send = () => {
      calls++
      return Promise.resolve(new Response('ok', { status: 200 }))
    }

    const response = await requestWithRetries(send, immediate)

    expect(response.status).toBe(200)
    expect(calls).toBe(1)
  })

  test('retries a rejected send and resolves once it succeeds', async () => {
    let calls = 0
    const send = () => {
      calls++
      if (calls < 2) throw new Error('network down')
      return Promise.resolve(new Response('ok', { status: 200 }))
    }

    const response = await requestWithRetries(send, immediate)

    expect(response.ok).toBe(true)
    expect(calls).toBe(2)
  })

  test('retries a non-ok response then throws after the attempt budget', async () => {
    let calls = 0
    const send = () => {
      calls++
      return Promise.resolve(new Response('nope', { status: 503 }))
    }

    try {
      await requestWithRetries(send, immediate)
      throw new Error('expected requestWithRetries to reject')
    } catch (caughtError) {
      expect(caughtError).toBeInstanceOf(Error)
      expect((caughtError as Error).message).toContain('status 503')
    }

    expect(calls).toBe(3)
  })
})
