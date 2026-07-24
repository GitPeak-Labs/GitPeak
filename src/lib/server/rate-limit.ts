import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

let ratelimit: Ratelimit | null | undefined

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[rate-limit] UPSTASH_REDIS_REST_* not set — rate limiting disabled')
    ratelimit = null
    return ratelimit
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    prefix: 'gitpeak-image-endpoints',
  })

  return ratelimit
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRatelimit()

  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)
  return { success, limit, remaining, reset }
}
