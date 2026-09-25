import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import { formatNumber } from '$lib/shared/lib/number-formatting'

type WallpaperStat = {
  label: string
  countLabel: string
  color: string
}

export function buildWallpaperStats(statistics: GithubStats, theme: ThemeTokens): WallpaperStat[] {
  return [
    { label: 'Contributions', count: statistics.totalContributions, color: theme.foam },
    { label: 'Commits', count: statistics.totalCommits, color: theme.iris },
    { label: 'Stars', count: statistics.totalStars, color: theme.gold },
    { label: 'Repos', count: statistics.totalRepos, color: theme.pine },
    { label: 'Followers', count: statistics.followers, color: theme.rose },
    { label: 'Pull Requests', count: statistics.totalPrs, color: theme.love },
  ].map((stat) => ({ label: stat.label, countLabel: formatNumber(stat.count), color: stat.color }))
}
