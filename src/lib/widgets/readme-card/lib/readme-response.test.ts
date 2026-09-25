import { describe, expect, test } from 'bun:test'
import { createReadmeSvgResponse } from './readme-response'

describe('createReadmeSvgResponse', () => {
  test('serves the SVG with caching disabled at every layer', () => {
    const response = createReadmeSvgResponse('<svg />')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8')
    expect(response.headers.get('cache-control')).toContain('no-cache')
    expect(response.headers.get('cdn-cache-control')).toBe('no-store')
    expect(response.headers.get('vercel-cdn-cache-control')).toBe('no-store')
  })
})
