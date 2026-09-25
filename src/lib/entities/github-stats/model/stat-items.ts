import {
  Star,
  Users,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  BookOpen,
  Activity,
} from 'lucide-svelte'
import type { GithubStats } from './github-stats'

export type StatItem = {
  label: string
  count: number
  icon: unknown
  accentVar: string
}

export function heroItems(stats: GithubStats): StatItem[] {
  return [
    { label: 'Contributions', count: stats.totalContributions, icon: Activity, accentVar: 'foam' },
    { label: 'Commits', count: stats.totalCommits, icon: GitCommitHorizontal, accentVar: 'iris' },
  ]
}

export function detailItems(stats: GithubStats): StatItem[] {
  return [
    { label: 'Stars', count: stats.totalStars, icon: Star, accentVar: 'gold' },
    { label: 'Repos', count: stats.totalRepos, icon: BookOpen, accentVar: 'iris' },
    { label: 'Followers', count: stats.followers, icon: Users, accentVar: 'rose' },
    { label: 'PRs', count: stats.totalPrs, icon: GitPullRequest, accentVar: 'love' },
    { label: 'Issues', count: stats.totalIssues, icon: CircleDot, accentVar: 'gold' },
  ]
}
