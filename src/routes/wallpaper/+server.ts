import { render } from 'svelte/server'
import { dev } from '$app/environment'
import { Resvg } from '@resvg/resvg-js'
import { createGithubClient } from '$lib/github/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/github/api/config'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import { fetchAsDataUri } from '$lib/readme/remote-image'
import { getWallpaperFontFiles } from '$lib/readme/server-assets'
import WallpaperCard from '$lib/wallpaper/WallpaperCard.svelte'
import { buildWallpaperStyles } from '$lib/wallpaper/wallpaper-font-styles'
import { getWallpaperFormat } from '$lib/wallpaper/wallpaper-formats'
import { checkRateLimit } from '$lib/server/rate-limit'
import { getHotStats, setHotStats } from '$lib/server/hot-stats-cache'
import type { RequestHandler } from './$types'

const PREVIEW_AVATAR_SIZE_PIXELS = 160

function withAvatarSizeHint(avatarUrl: string, sizePixels: number): string {
  try {
    const url = new URL(avatarUrl)
    url.searchParams.set('size', String(sizePixels))
    return url.toString()
  } catch {
    return avatarUrl
  }
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()

  if (!username) return new Response('Missing username', { status: 400 })

  const format = getWallpaperFormat(event.url.searchParams.get('format'))

  if (!format) return new Response('Invalid format', { status: 400 })

  const requestedPreviewWidth = Number(event.url.searchParams.get('previewWidth'))
  const rasterWidth =
    Number.isFinite(requestedPreviewWidth) && requestedPreviewWidth > 0
      ? Math.min(requestedPreviewWidth, format.width)
      : format.width
  const isPreview = rasterWidth !== format.width

  const [rateLimit, hotStats] = await Promise.all([
    checkRateLimit(event.getClientAddress()),
    getHotStats(username),
  ])

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.max(0, Math.ceil((rateLimit.reset - Date.now()) / 1000))
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' },
    })
  }

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  let statistics = hotStats

  if (!statistics) {
    const client = createGithubClient({
      apiUrl: GHFETCH_STATS_URL,
      requestTimeoutMilliseconds: 8000,
    })

    const result = await client.fetchStats(username)

    if (!result.ok) {
      const status = result.error.kind === 'not-found' ? 404 : 502
      return new Response(result.error.message, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    statistics = result.value
    statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []
    await setHotStats(username, statistics)
  }

  const avatarUrl = isPreview
    ? withAvatarSizeHint(statistics.avatarUrl, PREVIEW_AVATAR_SIZE_PIXELS)
    : statistics.avatarUrl

  const [fontFiles, avatarDataUri] = await Promise.all([
    getWallpaperFontFiles(),
    fetchAsDataUri(avatarUrl),
  ])

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
    fitTo: { mode: 'width', value: rasterWidth },
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
  const pngBuffer = resvg.render().asPng()

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': isPreview
        ? 'inline'
        : `attachment; filename="gitpeak-${username}-${format.id}.png"`,
      'Cache-Control': dev ? 'no-store' : 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
