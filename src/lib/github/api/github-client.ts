import { error, ok, type Result } from '$lib/core/network/result-type'
import { githubStatsSchema, type GithubStats } from '../models/github-stats'

export interface GithubClientConfig {
  apiUrl: string
  requestTimeoutMilliseconds: number
}

export interface GithubClientError {
  message: string
  kind: 'not-found' | 'transient'
}

const NOT_FOUND = 404
const RATE_LIMITED = 429
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const INTERNAL_SERVER_ERROR = 500

const RETRY_DELAY_MILLISECONDS = 250

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    [NOT_FOUND]: 'GitHub user not found',
    [RATE_LIMITED]: 'Rate limited — try again in a moment',
    [BAD_GATEWAY]: 'Service is unavailable, try again shortly',
    [SERVICE_UNAVAILABLE]: 'Service is unavailable, try again shortly',
  }

  if (status >= INTERNAL_SERVER_ERROR) return 'Something went wrong on our end, try again shortly'

  return messages[status] ?? 'Unexpected error, please try again'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function keysToCamel(item: unknown): unknown {
  if (Array.isArray(item)) return item.map((value) => keysToCamel(value))

  if (item !== null && typeof item === 'object') {
    const record = item as Record<string, unknown>
    return Object.keys(record).reduce<Record<string, unknown>>((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
      return {
        ...result,
        [camelKey]: keysToCamel(record[key]),
      }
    }, {})
  }

  return item
}

async function attemptFetchStats(
  config: GithubClientConfig,
  sanitizedUsername: string,
): Promise<Result<GithubStats, GithubClientError>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMilliseconds)

  try {
    const encodedUsername = encodeURIComponent(sanitizedUsername)
    const url = `${config.apiUrl}?username=${encodedUsername}&_t=${Date.now()}`

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const kind = response.status === NOT_FOUND ? 'not-found' : 'transient'

      return error({ message: getErrorMessage(response.status), kind })
    }

    const rawResponse = await response.json()

    if (!rawResponse.ok)
      return error({ message: 'Could not load this profile — try again', kind: 'transient' })

    const parsedStats = githubStatsSchema.safeParse(keysToCamel(rawResponse.data))
    if (!parsedStats.success)
      return error({ message: 'Received an unexpected response — try again', kind: 'transient' })

    return ok(parsedStats.data)
  } catch (caughtError: unknown) {
    clearTimeout(timeoutId)

    if (caughtError instanceof Error) {
      if (caughtError.name === 'AbortError')
        return error({ message: 'Request timed out', kind: 'transient' })

      return error({ message: caughtError.message, kind: 'transient' })
    }

    return error({ message: 'Network connection failed', kind: 'transient' })
  }
}

function isRetryable(result: Result<GithubStats, GithubClientError>): boolean {
  if (result.ok) return false

  if (result.error.kind !== 'transient') return false

  return result.error.message !== 'Request timed out'
}

export function createGithubClient(config: GithubClientConfig) {
  return {
    async fetchStats(username: string): Promise<Result<GithubStats, GithubClientError>> {
      const sanitizedUsername = username.trim().toLowerCase()

      const firstAttempt = await attemptFetchStats(config, sanitizedUsername)
      if (!isRetryable(firstAttempt)) return firstAttempt

      await sleep(RETRY_DELAY_MILLISECONDS)
      return attemptFetchStats(config, sanitizedUsername)
    },
  }
}
