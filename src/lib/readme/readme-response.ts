type ReadmeCacheProfile = 'fallback' | 'stale' | 'success'

const CACHE_HEADERS: Record<ReadmeCacheProfile, Record<string, string>> = {
  success: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    'Vercel-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  },
  stale: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
  fallback: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'Vercel-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  },
}

export function createReadmeSvgResponse(svg: string, cacheProfile: ReadmeCacheProfile): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      ...CACHE_HEADERS[cacheProfile],
    },
  })
}
