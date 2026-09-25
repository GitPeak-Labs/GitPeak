import { z } from 'zod'
import { githubStatsSchema } from '$lib/entities/github-stats/model/github-stats'
import { withTimeout } from '$lib/shared/lib/promise-timeout'
import { getRedis } from '$lib/server/redis'

const CACHE_VERSION = 3
const SECONDS_PER_DAY = 86_400
const CACHE_TTL_DAYS = 30
const CACHE_REQUEST_TIMEOUT_MILLISECONDS = 750
const CONCURRENT_VIEW_REFRESH_LOCK_SECONDS = 10
const REDIS_SET_SUCCESS_REPLY = 'OK'

const readmeCacheEntrySchema = z.object({
  stats: githubStatsSchema,
  avatarDataUri: z.string(),
})

export type ReadmeCacheEntry = z.infer<typeof readmeCacheEntrySchema>

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

function cacheKey(username: string): string {
  return `gitpeak-readme-stats:v${CACHE_VERSION}:${normalizeUsername(username)}`
}

function refreshLockKey(username: string): string {
  return `gitpeak-readme-refresh:v${CACHE_VERSION}:${normalizeUsername(username)}`
}

export async function getCachedReadmeEntry(username: string): Promise<ReadmeCacheEntry | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const cachedEntry = await withTimeout(
      redis.get<unknown>(cacheKey(username)),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'README stats cache read timed out',
    )
    const parsedEntry = readmeCacheEntrySchema.safeParse(cachedEntry)
    return parsedEntry.success ? parsedEntry.data : null
  } catch (error) {
    console.warn('[readme] Could not read the last successful stats:', error)
    return null
  }
}

export async function cacheReadmeEntry(username: string, entry: ReadmeCacheEntry): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await withTimeout(
      redis.set(cacheKey(username), entry, { ex: CACHE_TTL_DAYS * SECONDS_PER_DAY }),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'README stats cache write timed out',
    )
  } catch (error) {
    console.warn('[readme] Could not cache successful stats:', error)
  }
}

export async function acquireRefreshLock(username: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true

  try {
    const lockReply = await withTimeout(
      redis.set(refreshLockKey(username), 1, {
        nx: true,
        ex: CONCURRENT_VIEW_REFRESH_LOCK_SECONDS,
      }),
      CACHE_REQUEST_TIMEOUT_MILLISECONDS,
      'README refresh lock timed out',
    )
    return lockReply === REDIS_SET_SUCCESS_REPLY
  } catch {
    return false
  }
}
