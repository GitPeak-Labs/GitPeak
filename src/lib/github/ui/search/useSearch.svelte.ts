import { createQuery } from '@tanstack/svelte-query'
import { createGithubClient } from '$lib/github/api/github-client'
import { GHFETCH_STATS_URL } from '$lib/github/api/config'

const client = createGithubClient({
  apiUrl: GHFETCH_STATS_URL,
  requestTimeoutMilliseconds: 8000,
})

export function useSearch() {
  let currentUsername = $state('')

  const query = createQuery(() => ({
    queryKey: ['github-stats', currentUsername],
    queryFn: async () => {
      const result = await client.fetchStats(currentUsername)

      if (!result.ok) throw new Error(result.error.message)

      return result.value
    },
    enabled: currentUsername.length > 0,
  }))

  function onSearch(username: string) {
    if (!username) return

    currentUsername = username
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
