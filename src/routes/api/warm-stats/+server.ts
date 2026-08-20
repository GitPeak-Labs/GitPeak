import { z } from 'zod'
import { githubStatsSchema } from '$lib/github/models/github-stats'
import { setHotStats } from '$lib/server/hot-stats-cache'
import { checkRateLimit } from '$lib/server/rate-limit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async (event) => {
  const rateLimit = await checkRateLimit(event.getClientAddress())
  if (!rateLimit.success) return new Response(null, { status: 429 })

  let body: unknown
  try {
    body = await event.request.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  const parsedBody = z
    .object({ username: z.string().min(1), stats: githubStatsSchema })
    .safeParse(body)

  if (!parsedBody.success) return new Response(null, { status: 400 })

  await setHotStats(parsedBody.data.username, parsedBody.data.stats)

  return new Response(null, { status: 204 })
}
