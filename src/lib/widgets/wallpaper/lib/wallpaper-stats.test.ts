import { describe, expect, test } from 'bun:test'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import { buildWallpaperStats } from './wallpaper-stats'

const THEME = PRESET_THEMES['Rosé Pine']

const STATS: GithubStats = {
  displayName: null,
  avatarUrl: '',
  bio: null,
  followers: 47,
  following: 0,
  accountCreatedAt: '2022-10-01T00:00:00Z',
  languages: [],
  involvedRepos: [],
  mostStarredRepo: null,
  collaborators: [],
  totalContributions: 2305,
  totalCommits: 2140,
  totalStars: 67,
  totalRepos: 29,
  totalPrs: 12,
  totalIssues: 106,
}

describe('buildWallpaperStats', () => {
  test('lists the six wallpaper stats in order with compact numbers', () => {
    expect(buildWallpaperStats(STATS, THEME).map((stat) => [stat.label, stat.countLabel])).toEqual([
      ['Contributions', '2.3k'],
      ['Commits', '2.1k'],
      ['Stars', '67'],
      ['Repos', '29'],
      ['Followers', '47'],
      ['Pull Requests', '12'],
    ])
  })

  test('gives each stat its own theme accent', () => {
    const colors = buildWallpaperStats(STATS, THEME).map((stat) => stat.color)

    expect(new Set(colors).size).toBe(colors.length)
  })
})
