import { render } from 'svelte/server'
import { dev } from '$app/environment'
import { Resvg } from '@resvg/resvg-js'
import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import { fetchAsDataUri } from '$lib/server/remote-image'
import { getWallpaperFontFiles, type WallpaperFontFiles } from '$lib/server/font-assets'
import WallpaperCard from '$lib/widgets/wallpaper/ui/WallpaperCard.svelte'
import { buildWallpaperStyles } from '$lib/widgets/wallpaper/lib/wallpaper-font-styles'
import {
  getWallpaperFormat,
  type WallpaperFormat,
} from '$lib/widgets/wallpaper/lib/wallpaper-formats'
import { resolveWallpaperTheme } from '$lib/widgets/wallpaper/lib/wallpaper-theme-param'
import { checkRateLimit, type RateLimitResult } from '$lib/server/rate-limit'
import { getHotStats, setHotStats } from '$lib/server/hot-stats-cache'
import type { RequestHandler } from './$types'

const COLD_RENDER_TIMEOUT_SECONDS = 60
const STATS_REQUEST_TIMEOUT_MILLISECONDS = 8000
const MILLISECONDS_PER_SECOND = 1000
const HOUR_IN_SECONDS = 3600
const DAY_IN_SECONDS = 86_400
const HTTP_STATUS_NOT_FOUND = 404
const HTTP_STATUS_BAD_GATEWAY = 502
const RESVG_FIT_WIDTH_KEY = 'value'

export const config = { maxDuration: COLD_RENDER_TIMEOUT_SECONDS }

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

async function resolveWallpaperStatistics(
  username: string,
  hotStats: GithubStats | null,
): Promise<GithubStats | Response> {
  if (hotStats) return hotStats

  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: STATS_REQUEST_TIMEOUT_MILLISECONDS,
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
  await setHotStats(username, statistics)
  return statistics
}

type WallpaperRenderInput = {
  statistics: GithubStats
  username: string
  theme: ThemeTokens
  avatarDataUri: string
  format: WallpaperFormat
  fontFiles: WallpaperFontFiles
}

function renderWallpaperPng(input: WallpaperRenderInput): Buffer {
  const { statistics, username, theme, avatarDataUri, format, fontFiles } = input

  const { body } = render(WallpaperCard, {
    props: {
      statistics,
      username,
      theme,
      avatarDataUri,
      width: format.width,
      height: format.height,
    },
  })
  const fontStyles = buildWallpaperStyles(theme)
  const svg = body.replace('<defs>', `<defs><style>${fontStyles}</style>`)

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', [RESVG_FIT_WIDTH_KEY]: format.width },
    font: {
      fontFiles: [
        fontFiles.mono,
        fontFiles.bookSerif,
        fontFiles.bookSerifBold,
        fontFiles.jp,
        fontFiles.serifJp,
        fontFiles.serifJpBold,
      ].filter(Boolean),
      loadSystemFonts: false,
      defaultFontFamily: 'JetBrains Mono',
    },
  })
  return resvg.render().asPng()
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()

  if (!username) return new Response('Missing username', { status: 400 })

  const format = getWallpaperFormat(event.url.searchParams.get('format'))

  if (!format) return new Response('Invalid format', { status: 400 })

  const [rateLimit, hotStats] = await Promise.all([
    checkRateLimit(event.getClientAddress()),
    getHotStats(username),
  ])

  if (!rateLimit.success) return buildRateLimitedResponse(rateLimit)

  const theme = resolveWallpaperTheme(
    event.url.searchParams.get('theme'),
    event.url.searchParams.get('t'),
  )

  const statistics = await resolveWallpaperStatistics(username, hotStats)
  if (statistics instanceof Response) return statistics

  const [fontFiles, avatarDataUri] = await Promise.all([
    getWallpaperFontFiles(),
    fetchAsDataUri(statistics.avatarUrl),
  ])

  const pngBuffer = renderWallpaperPng({
    statistics,
    username,
    theme,
    avatarDataUri,
    format,
    fontFiles,
  })

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="gitpeak-${username}-${format.id}.png"`,
      'Cache-Control': dev
        ? 'no-store'
        : `public, max-age=${HOUR_IN_SECONDS}, stale-while-revalidate=${DAY_IN_SECONDS}`,
    },
  })
}
