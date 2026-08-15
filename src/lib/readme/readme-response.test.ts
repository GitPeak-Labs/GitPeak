import { describe, expect, test } from 'bun:test'
import { createReadmeSvgResponse } from './readme-response'

describe('createReadmeSvgResponse', () => {
  test('marks successful cards for long-lived Vercel edge caching', () => {
    const response = createReadmeSvgResponse('<svg />', 'success')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8')
    expect(response.headers.get('cache-control')).toContain('max-age=3600')
    expect(response.headers.get('vercel-cdn-cache-control')).toContain('max-age=86400')
    expect(response.headers.get('vercel-cdn-cache-control')).toContain(
      'stale-while-revalidate=604800',
    )
  })

  test('only caches a fallback card briefly', () => {
    const response = createReadmeSvgResponse('<svg />', 'fallback')

    expect(response.headers.get('cache-control')).toContain('max-age=60')
    expect(response.headers.get('vercel-cdn-cache-control')).toContain('max-age=60')
  })
})
