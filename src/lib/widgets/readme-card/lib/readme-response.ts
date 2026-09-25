const HTTP_OK = 200

const UNCACHEABLE_BY_CAMO_OR_CDN_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
}

export function createReadmeSvgResponse(svg: string): Response {
  return new Response(svg, {
    status: HTTP_OK,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      ...UNCACHEABLE_BY_CAMO_OR_CDN_HEADERS,
    },
  })
}
