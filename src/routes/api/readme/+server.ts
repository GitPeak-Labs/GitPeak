import { render } from 'svelte/server'
import { waitUntil } from '@vercel/functions'
import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import { README_FONT_DATA_URIS } from '$lib/widgets/readme-card/lib/readme-font-assets.server'
import ReadmeCard from '$lib/widgets/readme-card/ui/ReadmeCard.svelte'
import ReadmeFallbackCard from '$lib/widgets/readme-card/ui/ReadmeFallbackCard.svelte'
import { buildReadmeFontStyles } from '$lib/widgets/readme-card/lib/readme-font-styles'
import { createReadmeSvgResponse } from '$lib/widgets/readme-card/lib/readme-response'
import {
  embedStylesInSvg,
  resolveReadmeTheme,
  sizedAvatarUrl,
} from '$lib/widgets/readme-card/lib/readme-request'
import {
  acquireRefreshLock,
  cacheReadmeEntry,
  getCachedReadmeEntry,
  type ReadmeCacheEntry,
} from '$lib/server/readme-stats-cache'
import { fetchAsDataUri } from '$lib/server/remote-image'
import type { RequestHandler } from './$types'

type FetchTimeouts = {
  statsMilliseconds: number
  avatarMilliseconds: number
}

type FetchOutcome =
  | { kind: 'ok'; entry: ReadmeCacheEntry }
  | { kind: 'not-found' }
  | { kind: 'failed' }

const WITHIN_CAMO_BUDGET_TIMEOUTS: FetchTimeouts = {
  statsMilliseconds: 3000,
  avatarMilliseconds: 1000,
}
const AFTER_RESPONSE_TIMEOUTS: FetchTimeouts = {
  statsMilliseconds: 10_000,
  avatarMilliseconds: 3000,
}

const STATIC_ERROR_SVG =
  '<svg width="480" height="120" viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="480" height="120" rx="12" fill="#191724"/>' +
  '<text x="24" y="66" font-family="monospace" font-size="14" fill="#e0def4">' +
  'GitPeak stats are temporarily unavailable</text></svg>'

function toStyledSvgResponse(renderedSvg: string, theme: ThemeTokens): Response {
  const styles = buildReadmeFontStyles(
    { monoFontDataUri: README_FONT_DATA_URIS.mono, serifFontDataUri: README_FONT_DATA_URIS.serif },
    theme,
  )
  return createReadmeSvgResponse(embedStylesInSvg(renderedSvg, styles))
}

function renderFallback(username: string, theme: ThemeTokens, message?: string): Response {
  try {
    const { body } = render(ReadmeFallbackCard, { props: { username, theme, message } })
    return toStyledSvgResponse(body, theme)
  } catch (fallbackError) {
    console.error('[readme] Fallback card also failed to render:', fallbackError)
    return createReadmeSvgResponse(STATIC_ERROR_SVG)
  }
}

function renderEntry(entry: ReadmeCacheEntry, username: string, theme: ThemeTokens): Response {
  const { body } = render(ReadmeCard, {
    props: { statistics: entry.stats, username, theme, avatarDataUri: entry.avatarDataUri },
  })
  return toStyledSvgResponse(body, theme)
}

async function fetchAndCacheEntry(
  username: string,
  timeouts: FetchTimeouts,
): Promise<FetchOutcome> {
  const client = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: timeouts.statsMilliseconds,
  })
  const statsResult = await client.fetchStats(username)
  if (!statsResult.ok) {
    return statsResult.error.kind === 'not-found' ? { kind: 'not-found' } : { kind: 'failed' }
  }

  const stats = {
    ...statsResult.data,
    languages: Array.isArray(statsResult.data.languages) ? statsResult.data.languages : [],
  }
  const avatarDataUri = await fetchAsDataUri(
    sizedAvatarUrl(stats.avatarUrl),
    timeouts.avatarMilliseconds,
  )
  const entry = { stats, avatarDataUri }
  await cacheReadmeEntry(username, entry)
  return { kind: 'ok', entry }
}

async function refreshAfterResponse(username: string): Promise<void> {
  const hasRefreshLock = await acquireRefreshLock(username)
  if (!hasRefreshLock) return

  try {
    await fetchAndCacheEntry(username, AFTER_RESPONSE_TIMEOUTS)
  } catch (error) {
    console.warn('[readme] Background refresh failed:', error)
  }
}

async function renderFromCacheThenRefresh(username: string, theme: ThemeTokens): Promise<Response> {
  const cachedEntry = await getCachedReadmeEntry(username)
  if (cachedEntry) {
    waitUntil(refreshAfterResponse(username))
    return renderEntry(cachedEntry, username, theme)
  }

  const firstFetch = await fetchAndCacheEntry(username, WITHIN_CAMO_BUDGET_TIMEOUTS)
  if (firstFetch.kind === 'ok') return renderEntry(firstFetch.entry, username, theme)
  if (firstFetch.kind === 'not-found') {
    return renderFallback(username, theme, `User @${username} not found`)
  }

  waitUntil(refreshAfterResponse(username))
  return renderFallback(username, theme)
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()
  const theme = resolveReadmeTheme(event.url.searchParams.get('theme'))

  if (!username) return renderFallback('unknown', theme, 'Please provide a username')

  try {
    return await renderFromCacheThenRefresh(username, theme)
  } catch (error) {
    console.error('[readme] Render attempt failed, serving fallback card:', error)
    return renderFallback(username, theme)
  }
}
