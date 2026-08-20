import { githubStatsSchema, type GithubStats } from '$lib/github/models/github-stats'
import { withTimeout } from './promise-timeout'
import { getRedis } from './redis'

const CACHE_VERSION = 1
const HOT_CACHE_TTL_SECONDS = 45
const CACHE_REQUEST_TIMEOUT_MILLISECONDS = 500

function hotCacheKey(username: string): string {
  return `gitpeak-hot-stats:v${CACHE_VERSION}:${username.trim().toLowerCase()}`
}

export async function getHotStats(username: string): Promise<GithubStats | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const cached = await withTimeout(
      redis.get<unknown>(hotCacheKey(username)),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'Hot stats cache read timed out',
    )
    const parsed = githubStatsSchema.safeParse(cached)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export async function setHotStats(username: string, stats: GithubStats): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await withTimeout(
      redis.set(hotCacheKey(username), stats, { ex: HOT_CACHE_TTL_SECONDS }),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'Hot stats cache write timed out',
    )
  } catch {
    return
  }
}
