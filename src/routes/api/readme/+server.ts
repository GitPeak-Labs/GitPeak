import { render } from 'svelte/server'
import { createGithubClient } from '$lib/github/api/github-client'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import ReadmeCard from '$lib/readme/ReadmeCard.svelte'
import { buildReadmeFontStyles } from '$lib/readme/readme-font-styles'
import { fetchAsDataUri, getReadmeFonts } from '$lib/readme/server-assets'
import { checkRateLimit } from '$lib/server/rate-limit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()
  if (!username) return new Response('Missing username', { status: 400 })

  const rateLimit = await checkRateLimit(username.toLowerCase())
  if (!rateLimit.success) {
    const retryAfterSeconds = Math.max(0, Math.ceil((rateLimit.reset - Date.now()) / 1000))
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    })
  }

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  const client = createGithubClient({
    apiUrl: 'https://ghfetch.carlosranara.workers.dev/v1/stats',
    requestTimeoutMilliseconds: 8000,
  })

  const result = await client.fetchStats(username)
  if (!result.ok) return new Response('User not found', { status: 404 })

  const statistics = result.value
  statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []

  const [{ mono: monoB64, serif: serifB64 }, avatarDataUri] = await Promise.all([
    getReadmeFonts(),
    fetchAsDataUri(statistics.avatarUrl),
  ])

  const { body } = render(ReadmeCard, { props: { statistics, username, theme, avatarDataUri } })
  const fontStyles = buildReadmeFontStyles(monoB64, serifB64, theme)
  const svg = body.replace('<defs>', `<defs><style>${fontStyles}</style>`)

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  })
}
