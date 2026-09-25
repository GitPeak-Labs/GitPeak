import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'

export function warmServerStats(username: string, stats: GithubStats): void {
  fetch('/api/warm-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, stats }),
  }).catch(() => undefined)
}
