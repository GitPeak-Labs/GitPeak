import { z } from 'zod'
import { error, ok, type Result } from '$lib/shared/lib/result-type'
import { githubStatsSchema, type GithubStats } from '../model/github-stats'

export type GithubClientConfig = {
  apiUrl: string
  requestTimeoutMilliseconds: number
  retry?: boolean
}

type GithubClientError = {
  message: string
  kind: 'not-found' | 'transient'
}

type StatsResult = Result<GithubStats, GithubClientError>

const NOT_FOUND = 404
const RATE_LIMITED = 429
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const INTERNAL_SERVER_ERROR = 500

const RETRY_DELAY_MILLISECONDS = 250
const STATS_CACHE_TTL_MILLISECONDS = 30_000
const ABORT_ERROR_NAME = 'AbortError'
const UNAVAILABLE_MESSAGE = 'Service is unavailable, try again shortly'
const TIMED_OUT_MESSAGE = 'Request timed out'

const statsCache = new Map<string, { cachedResult: StatsResult; expiresAt: number }>()

const ghfetchEnvelopeSchema = z.object({
  ok: z.boolean(),
  data: z.unknown(),
})

function getCachedStats(cacheKey: string): StatsResult | undefined {
  const entry = statsCache.get(cacheKey)
  if (!entry) return undefined

  const isExpired = entry.expiresAt <= Date.now()
  if (isExpired) {
    statsCache.delete(cacheKey)
    return undefined
  }

  return entry.cachedResult
}

function cacheStats(cacheKey: string, cachedResult: StatsResult): void {
  statsCache.set(cacheKey, { cachedResult, expiresAt: Date.now() + STATS_CACHE_TTL_MILLISECONDS })
}

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    [NOT_FOUND]: 'GitHub user not found',
    [RATE_LIMITED]: 'Rate limited — try again in a moment',
    [BAD_GATEWAY]: UNAVAILABLE_MESSAGE,
    [SERVICE_UNAVAILABLE]: UNAVAILABLE_MESSAGE,
  }

  if (status >= INTERNAL_SERVER_ERROR) return 'Something went wrong on our end, try again shortly'
  return messages[status] ?? 'Unexpected error, please try again'
}

function sleep(delayMilliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMilliseconds)
  })
}

function toCamelCaseKey(snakeCaseKey: string): string {
  return snakeCaseKey.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())
}

function keysToCamel(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload.map((entry) => keysToCamel(entry))
  if (payload === null || typeof payload !== 'object') return payload

  const entries = Object.entries(payload as Record<string, unknown>)
  return Object.fromEntries(
    entries.map(([key, entry]) => [toCamelCaseKey(key), keysToCamel(entry)]),
  )
}

async function requestStats(
  config: GithubClientConfig,
  sanitizedUsername: string,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, config.requestTimeoutMilliseconds)

  const encodedUsername = encodeURIComponent(sanitizedUsername)
  const requestUrl = `${config.apiUrl}?username=${encodedUsername}&_t=${Date.now()}`

  try {
    return await fetch(requestUrl, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function toClientError(caughtError: unknown): GithubClientError {
  if (!(caughtError instanceof Error))
    return { message: 'Network connection failed', kind: 'transient' }
  if (caughtError.name === ABORT_ERROR_NAME)
    return { message: TIMED_OUT_MESSAGE, kind: 'transient' }
  return { message: caughtError.message, kind: 'transient' }
}

async function parseStatsResponse(response: Response): Promise<StatsResult> {
  if (!response.ok) {
    const kind = response.status === NOT_FOUND ? 'not-found' : 'transient'
    return error({ message: getErrorMessage(response.status), kind })
  }

  const parsedEnvelope = ghfetchEnvelopeSchema.safeParse(await response.json())
  if (!parsedEnvelope.success || !parsedEnvelope.data.ok) {
    return error({ message: 'Could not load this profile — try again', kind: 'transient' })
  }

  const parsedStats = githubStatsSchema.safeParse(keysToCamel(parsedEnvelope.data.data))
  if (!parsedStats.success) {
    return error({ message: 'Received an unexpected response — try again', kind: 'transient' })
  }

  return ok(parsedStats.data)
}

async function attemptFetchStats(
  config: GithubClientConfig,
  sanitizedUsername: string,
): Promise<StatsResult> {
  try {
    const response = await requestStats(config, sanitizedUsername)
    return await parseStatsResponse(response)
  } catch (caughtError: unknown) {
    return error(toClientError(caughtError))
  }
}

function isRetryable(statsResult: StatsResult): boolean {
  if (statsResult.ok) return false
  if (statsResult.error.kind !== 'transient') return false
  return statsResult.error.message !== TIMED_OUT_MESSAGE
}

async function fetchStatsWithRetry(
  config: GithubClientConfig,
  sanitizedUsername: string,
): Promise<StatsResult> {
  const firstAttempt = await attemptFetchStats(config, sanitizedUsername)
  if (!isRetryable(firstAttempt)) return firstAttempt

  await sleep(RETRY_DELAY_MILLISECONDS)
  return attemptFetchStats(config, sanitizedUsername)
}

export type GithubClient = {
  fetchStats: (username: string) => Promise<StatsResult>
}

export function createGithubClient(config: GithubClientConfig): GithubClient {
  return {
    async fetchStats(username: string): Promise<StatsResult> {
      const sanitizedUsername = username.trim().toLowerCase()
      const cacheKey = `${config.apiUrl}:${sanitizedUsername}`

      const cachedResult = getCachedStats(cacheKey)
      if (cachedResult) return cachedResult

      const statsResult = await fetchStatsWithRetry(config, sanitizedUsername)
      if (statsResult.ok) cacheStats(cacheKey, statsResult)

      return statsResult
    },
  }
}
