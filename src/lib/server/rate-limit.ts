import { Ratelimit } from '@upstash/ratelimit'
import { withTimeout } from '$lib/shared/lib/promise-timeout'
import { getRedis } from './redis'

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

let ratelimit: Ratelimit | null | undefined
const RATE_LIMIT_TIMEOUT_MILLISECONDS = 750
const RATE_LIMIT_MAX_REQUESTS = 60
const RATE_LIMIT_WINDOW = '60 s'
const FAIL_OPEN_RATE_LIMIT_RESULT: RateLimitResult = {
  success: true,
  limit: 0,
  remaining: 0,
  reset: 0,
}

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit

  const redis = getRedis()
  if (!redis) {
    console.warn('[rate-limit] UPSTASH_REDIS_REST_* not set — rate limiting disabled')
    ratelimit = null
    return ratelimit
  }

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW),
    prefix: 'gitpeak-image-endpoints',
  })

  return ratelimit
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRatelimit()

  if (!limiter) return FAIL_OPEN_RATE_LIMIT_RESULT

  try {
    const {
      success: isAllowed,
      limit,
      remaining,
      reset,
    } = await withTimeout(
      limiter.limit(identifier),
      RATE_LIMIT_TIMEOUT_MILLISECONDS,
      'Rate-limit store timed out',
    )
    return { success: isAllowed, limit, remaining, reset }
  } catch (error) {
    console.warn('[rate-limit] Check failed — allowing request:', error)
    return FAIL_OPEN_RATE_LIMIT_RESULT
  }
}
