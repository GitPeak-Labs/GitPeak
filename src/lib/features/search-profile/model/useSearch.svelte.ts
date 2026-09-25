import { createQuery } from '@tanstack/svelte-query'
import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
import { warmServerStats } from '$lib/entities/github-stats/api/warm-server-stats'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'

const STATS_REQUEST_TIMEOUT_MILLISECONDS = 8000
const SECONDS_PER_MINUTE = 60
const MILLISECONDS_PER_SECOND = 1000
const STATS_STALE_TIME_MILLISECONDS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND

const client = createGithubClient({
  apiUrl: GHFETCH_STATS_URL,
  requestTimeoutMilliseconds: STATS_REQUEST_TIMEOUT_MILLISECONDS,
})

type UseSearchApi = {
  readonly currentUsername: string
  readonly loading: boolean
  readonly error: string | null
  readonly stats: GithubStats | null
  readonly noResults: boolean
  onSearch: (username: string) => void
}

export function useSearch(): UseSearchApi {
  let currentUsername = $state('')

  const query = createQuery(() => ({
    queryKey: ['github-stats', currentUsername],
    queryFn: async () => {
      const statsResult = await client.fetchStats(currentUsername)

      if (!statsResult.ok) throw new Error(statsResult.error.message)

      warmServerStats(currentUsername, statsResult.data)

      return statsResult.data
    },
    enabled: currentUsername.length > 0,
    staleTime: STATS_STALE_TIME_MILLISECONDS,
  }))

  function onSearch(username: string) {
    if (!username) return

    if (currentUsername === username) {
      void query.refetch()
    } else {
      currentUsername = username
    }
  }

  return {
    get currentUsername() {
      return currentUsername
    },
    get loading() {
      return query.isLoading
    },
    get error() {
      return query.error?.message ?? null
    },
    get stats() {
      return query.data ?? null
    },
    get noResults() {
      return query.isError
    },
    onSearch,
  }
}
