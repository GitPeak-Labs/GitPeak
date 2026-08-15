import { Ratelimit } from '@upstash/ratelimit'
import { withTimeout } from './promise-timeout'
import { getRedis } from './redis'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

let ratelimit: Ratelimit | null | undefined
const RATE_LIMIT_TIMEOUT_MILLISECONDS = 750

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
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    prefix: 'gitpeak-image-endpoints',
  })

  return ratelimit
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRatelimit()

  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 }

  try {
    const { success, limit, remaining, reset } = await withTimeout(
      limiter.limit(identifier),
      RATE_LIMIT_TIMEOUT_MILLISECONDS,
      'Rate-limit store timed out',
    )
    return { success, limit, remaining, reset }
  } catch (error) {
    // An unavailable rate-limit store must never take down a public image endpoint.
    console.warn('[rate-limit] Check failed — allowing request:', error)
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}
