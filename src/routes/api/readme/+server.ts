import { render } from 'svelte/server'
import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import { README_FONT_DATA_URIS } from '$lib/widgets/readme-card/lib/readme-font-assets.server'
import ReadmeCard from '$lib/widgets/readme-card/ui/ReadmeCard.svelte'
import ReadmeFallbackCard from '$lib/widgets/readme-card/ui/ReadmeFallbackCard.svelte'
import { buildReadmeFontStyles } from '$lib/widgets/readme-card/lib/readme-font-styles'
import { createReadmeSvgResponse } from '$lib/widgets/readme-card/lib/readme-response'
import { cacheReadmeStats, getCachedReadmeStats } from '$lib/server/readme-stats-cache'
import { fetchAsDataUri } from '$lib/server/remote-image'
import { PRESET_THEMES, type ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import type { RequestHandler } from './$types'

const STATS_TIMEOUT_MILLISECONDS = 3000
const AVATAR_TIMEOUT_MILLISECONDS = 1000

function cleanSvg(svg: string): string {
  return svg.replace(/<!--[\s\S]*?-->/g, '').trim()
}

function injectFontStyles(svg: string, theme: ThemeTokens): string {
  const fontStyles = buildReadmeFontStyles(
    README_FONT_DATA_URIS.mono,
    README_FONT_DATA_URIS.serif,
    theme,
  )
  const styled = svg.replace('<defs>', `<defs><style>${fontStyles}</style>`)
  return cleanSvg(styled)
}

const STATIC_ERROR_SVG =
  '<svg width="480" height="120" viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="480" height="120" rx="12" fill="#191724"/>' +
  '<text x="24" y="66" font-family="monospace" font-size="14" fill="#e0def4">' +
  'GitPeak stats are temporarily unavailable</text></svg>'

function renderFallback(username: string, theme: ThemeTokens, message?: string): Response {
  try {
    const { body } = render(ReadmeFallbackCard, { props: { username, theme, message } })
    return createReadmeSvgResponse(injectFontStyles(body, theme), 'fallback')
  } catch (fallbackError) {
    console.error('[readme] Fallback card also failed to render:', fallbackError)
    return createReadmeSvgResponse(cleanSvg(STATIC_ERROR_SVG), 'fallback')
  }
}

function resolveTheme(requestedTheme: string | null): ThemeTokens {
  if (!requestedTheme) return PRESET_THEMES['Rosé Pine']

  if (PRESET_THEMES[requestedTheme]) return PRESET_THEMES[requestedTheme]

  const normalized = requestedTheme.toLowerCase().replace(/[-_+]/g, ' ').trim()
  for (const [name, tokens] of Object.entries(PRESET_THEMES)) {
    const normalizedPreset = name
      .toLowerCase()
      .replace(/[-_+é]/g, (c) => (c === 'é' ? 'e' : ' '))
      .trim()
    if (normalizedPreset === normalized.replace(/é/g, 'e')) {
      return tokens
    }
  }
  return PRESET_THEMES['Rosé Pine']
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

async function attemptRender(username: string, theme: ThemeTokens): Promise<Response> {
  const cachedStatisticsPromise = getCachedReadmeStats(username)

  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: STATS_TIMEOUT_MILLISECONDS,
    retry: false,
  })

  const result = await client.fetchStats(username)

  if (!result.ok) {
    if (result.error.kind === 'not-found')
      return renderFallback(username, theme, `User @${username} not found`)

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

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()

  if (!username)
    return renderFallback('unknown', PRESET_THEMES['Rosé Pine'], 'Please provide a username')

  const theme = resolveTheme(event.url.searchParams.get('theme'))

  try {
    return await attemptRender(username, theme)
  } catch (error) {
    console.error('[readme] Render attempt failed, serving fallback card:', error)
    const cachedStatistics = await getCachedReadmeStats(username).catch(() => null)
    if (cachedStatistics) {
      try {
        return await renderStatistics(cachedStatistics, username, theme, 'stale')
      } catch {
        // Fall through to fallback card
      }
    }
    return renderFallback(username, theme)
  }
}
