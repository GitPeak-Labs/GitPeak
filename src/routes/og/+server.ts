import { render } from 'svelte/server'
import { dev } from '$app/environment'
import { Resvg } from '@resvg/resvg-js'
import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
import {
  DEFAULT_PRESET_NAME,
  PRESET_THEMES,
  type ThemeTokens,
} from '$lib/entities/theme/model/theme-manager'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import OgCard from '$lib/widgets/og-card/ui/OgCard.svelte'
import { buildOgStyles } from '$lib/widgets/readme-card/lib/readme-font-styles'
import { fetchAsDataUri } from '$lib/server/remote-image'
import { getOgFontFiles } from '$lib/server/font-assets'
import { checkRateLimit, type RateLimitResult } from '$lib/server/rate-limit'
import type { RequestHandler } from './$types'

const MILLISECONDS_PER_SECOND = 1000
const HTTP_STATUS_NOT_FOUND = 404
const HTTP_STATUS_BAD_GATEWAY = 502
const RESVG_FIT_WIDTH_KEY = 'value'

function buildRateLimitedResponse(rateLimit: RateLimitResult): Response {
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((rateLimit.reset - Date.now()) / MILLISECONDS_PER_SECOND),
  )
  return new Response('Too Many Requests', {
    status: 429,
    headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' },
  })
}

function resolveOgTheme(requestedThemeName: string): ThemeTokens {
  const isKnownPreset = Object.hasOwn(PRESET_THEMES, requestedThemeName)
  return isKnownPreset ? PRESET_THEMES[requestedThemeName] : PRESET_THEMES[DEFAULT_PRESET_NAME]
}

async function fetchOgStatistics(username: string): Promise<GithubStats | Response> {
  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: 8000,
  })

  const statsFetchResult = await client.fetchStats(username)
  if (!statsFetchResult.ok) {
    const status =
      statsFetchResult.error.kind === 'not-found' ? HTTP_STATUS_NOT_FOUND : HTTP_STATUS_BAD_GATEWAY
    return new Response(statsFetchResult.error.message, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const statistics = statsFetchResult.data
  statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []
  return statistics
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()

  if (!username) return new Response('Missing username', { status: 400 })

  const rateLimit = await checkRateLimit(username.toLowerCase())
  if (!rateLimit.success) return buildRateLimitedResponse(rateLimit)

  const requestedThemeName = event.url.searchParams.get('theme') || DEFAULT_PRESET_NAME
  const theme = resolveOgTheme(requestedThemeName)

  const statistics = await fetchOgStatistics(username)
  if (statistics instanceof Response) return statistics

  const [fontFiles, avatarDataUri] = await Promise.all([
    getOgFontFiles(),
    fetchAsDataUri(statistics.avatarUrl),
  ])

  const { body } = render(OgCard, { props: { statistics, username, theme, avatarDataUri } })
  const fontStyles = buildOgStyles(theme)
  const svg = body.replace('<defs>', `<defs><style>${fontStyles}</style>`)

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', [RESVG_FIT_WIDTH_KEY]: 1200 },
    font: {
      fontFiles: [fontFiles.mono, fontFiles.serif, fontFiles.jp, fontFiles.serifJp].filter(Boolean),
      loadSystemFonts: false,
      defaultFontFamily: 'JetBrains Mono',
    },
  })
  const pngBuffer = resvg.render().asPng()

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': dev ? 'no-store' : 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
