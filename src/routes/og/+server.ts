import { render } from 'svelte/server'
import { dev } from '$app/environment'
import { Resvg } from '@resvg/resvg-js'
import { createGithubClient } from '$lib/github/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/github/api/config'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import OgCard from '$lib/readme/OgCard.svelte'
import { buildOgStyles } from '$lib/readme/readme-font-styles'
import { fetchAsDataUri, getOgFontFiles } from '$lib/readme/server-assets'
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
      headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' },
    })
  }

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: 8000,
  })

  const result = await client.fetchStats(username)
  if (!result.ok) {
    const status = result.error.kind === 'not-found' ? 404 : 502
    return new Response(result.error.message, { status, headers: { 'Cache-Control': 'no-store' } })
  }

  const statistics = result.value
  statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []

  const [fontFiles, avatarDataUri] = await Promise.all([
    getOgFontFiles(),
    fetchAsDataUri(statistics.avatarUrl),
  ])

  const { body } = render(OgCard, { props: { statistics, username, theme, avatarDataUri } })
  const fontStyles = buildOgStyles(theme)
  const svg = body.replace('<defs>', `<defs><style>${fontStyles}</style>`)

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
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
