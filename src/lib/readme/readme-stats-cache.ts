import { githubStatsSchema, type GithubStats } from '$lib/github/models/github-stats'
import { withTimeout } from '$lib/server/promise-timeout'
import { getRedis } from '$lib/server/redis'

const CACHE_VERSION = 1
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7
const CACHE_REQUEST_TIMEOUT_MILLISECONDS = 750

function cacheKey(username: string): string {
  return `gitpeak-readme-stats:v${CACHE_VERSION}:${username.trim().toLowerCase()}`
}

export async function getCachedReadmeStats(username: string): Promise<GithubStats | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const cached = await withTimeout(
      redis.get<unknown>(cacheKey(username)),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'README stats cache read timed out',
    )
    const parsed = githubStatsSchema.safeParse(cached)
    return parsed.success ? parsed.data : null
  } catch (error) {
    console.warn('[readme] Could not read the last successful stats:', error)
    return null
  }
}

export async function cacheReadmeStats(username: string, stats: GithubStats): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await withTimeout(
      redis.set(cacheKey(username), stats, { ex: CACHE_TTL_SECONDS }),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'README stats cache write timed out',
    )
  } catch (error) {
    // Rendering succeeded, so a cache outage should not turn the image request into an error.
    console.warn('[readme] Could not cache successful stats:', error)
  }
}
