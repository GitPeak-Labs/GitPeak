import { createQuery } from '@tanstack/svelte-query'
import { createGithubClient } from '$lib/github/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/github/api/config'
import type { GithubStats } from '$lib/github/models/github-stats'

const client = createGithubClient({
  apiUrl: GHFETCH_STATS_URL,
  requestTimeoutMilliseconds: 8000,
})

function warmStatsCache(username: string, stats: GithubStats): void {
  fetch('/api/warm-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, stats }),
  }).catch(() => {})
}

export function useSearch() {
  let currentUsername = $state('')

  const query = createQuery(() => ({
    queryKey: ['github-stats', currentUsername],
    queryFn: async () => {
      const result = await client.fetchStats(currentUsername)

      if (!result.ok) throw new Error(result.error.message)

      warmStatsCache(currentUsername, result.value)

      return result.value
    },
    enabled: currentUsername.length > 0,
    staleTime: 60 * 1000,
  }))

  function onSearch(username: string) {
    if (!username) return

    if (currentUsername === username) {
      query.refetch()
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
