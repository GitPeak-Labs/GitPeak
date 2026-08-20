import { render } from 'svelte/server'
import { createGithubClient } from '$lib/github/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/github/api/config'
import type { GithubStats } from '$lib/github/models/github-stats'
import { README_FONT_DATA_URIS } from '$lib/readme/readme-font-assets'
import ReadmeCard from '$lib/readme/ReadmeCard.svelte'
import ReadmeFallbackCard from '$lib/readme/ReadmeFallbackCard.svelte'
import { buildReadmeFontStyles } from '$lib/readme/readme-font-styles'
import { createReadmeSvgResponse } from '$lib/readme/readme-response'
import { cacheReadmeStats, getCachedReadmeStats } from '$lib/readme/readme-stats-cache'
import { fetchAsDataUri } from '$lib/readme/remote-image'
import { checkRateLimit } from '$lib/server/rate-limit'
import { PRESET_THEMES, type ThemeTokens } from '$lib/theme/theme-manager'
import type { RequestHandler } from './$types'

const STATS_TIMEOUT_MILLISECONDS = 6500
const AVATAR_TIMEOUT_MILLISECONDS = 2000

function injectFontStyles(svg: string, theme: ThemeTokens): string {
  const fontStyles = buildReadmeFontStyles(
    README_FONT_DATA_URIS.mono,
    README_FONT_DATA_URIS.serif,
    theme,
  )
  return svg.replace('<defs>', `<defs><style>${fontStyles}</style>`)
}

const STATIC_ERROR_SVG =
  '<svg width="480" height="120" viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="480" height="120" rx="12" fill="#191724"/>' +
  '<text x="24" y="66" font-family="monospace" font-size="14" fill="#e0def4">' +
  'GitPeak stats are temporarily unavailable</text></svg>'

function renderFallback(username: string, theme: ThemeTokens): Response {
  try {
    const { body } = render(ReadmeFallbackCard, { props: { username, theme } })
    return createReadmeSvgResponse(injectFontStyles(body, theme), 'fallback')
  } catch (fallbackError) {
    console.error('[readme] Fallback card also failed to render:', fallbackError)
    return createReadmeSvgResponse(STATIC_ERROR_SVG, 'fallback')
  }
}

async function renderStatistics(
  statistics: GithubStats,
  username: string,
  theme: ThemeTokens,
  cacheProfile: 'stale' | 'success',
): Promise<Response> {
  const avatarDataUri = await fetchAsDataUri(statistics.avatarUrl, AVATAR_TIMEOUT_MILLISECONDS)
  const { body } = render(ReadmeCard, {
    props: { statistics, username, theme, avatarDataUri },
  })

  return createReadmeSvgResponse(injectFontStyles(body, theme), cacheProfile)
}

async function attemptRender(username: string, theme: ThemeTokens): Promise<Response | null> {
  const rateLimit = await checkRateLimit(username.toLowerCase())

  if (!rateLimit.success) {
    const cachedStatistics = await getCachedReadmeStats(username)
    if (cachedStatistics) return renderStatistics(cachedStatistics, username, theme, 'stale')

    return renderFallback(username, theme)
  }

  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: STATS_TIMEOUT_MILLISECONDS,
  })

  // Read the last successful result alongside the upstream request. It adds no serial latency and
  // lets cold serverless instances render the real card when the stats worker has a brief outage.
  const cachedStatisticsPromise = getCachedReadmeStats(username)
  const result = await client.fetchStats(username)

  if (!result.ok) {
    if (result.error.kind === 'not-found') return null

    const cachedStatistics = await cachedStatisticsPromise
    if (cachedStatistics) return renderStatistics(cachedStatistics, username, theme, 'stale')

    return renderFallback(username, theme)
  }

  const statistics = result.value
  statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []

  const [, response] = await Promise.all([
    cacheReadmeStats(username, statistics),
    renderStatistics(statistics, username, theme, 'success'),
  ])
  return response
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const RETRY_DELAY_MILLISECONDS = 300

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()

  if (!username) return new Response('Missing username', { status: 400 })

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  try {
    const response = await attemptRender(username, theme)
    if (response) return response
  } catch (firstError) {
    console.error('[readme] Render failed, retrying once:', firstError)
    await sleep(RETRY_DELAY_MILLISECONDS)

    try {
      const response = await attemptRender(username, theme)
      if (response) return response
    } catch (secondError) {
      console.error('[readme] Retry also failed, serving fallback card:', secondError)
      return renderFallback(username, theme)
    }
  }

  return new Response('GitHub user not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  })
}
