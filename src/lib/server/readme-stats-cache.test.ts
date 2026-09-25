import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'

type SetOptions = { nx?: boolean; ex?: number }

const storedEntries = new Map<string, unknown>()

const inMemoryRedis = {
  get: (key: string): Promise<unknown> => Promise.resolve(storedEntries.get(key) ?? null),
  set: (key: string, entry: unknown, options: SetOptions = {}): Promise<string | null> => {
    const isBlockedByExistingKey = options.nx === true && storedEntries.has(key)
    if (isBlockedByExistingKey) return Promise.resolve(null)
    storedEntries.set(key, entry)
    return Promise.resolve('OK')
  },
}

const redisState = { isConfigured: true }

void mock.module('$lib/server/redis', () => ({
  getRedis: () => (redisState.isConfigured ? inMemoryRedis : null),
}))

const { acquireRefreshLock, cacheReadmeEntry, getCachedReadmeEntry } =
  await import('./readme-stats-cache')

const STATS: GithubStats = {
  displayName: 'Octo Cat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1',
  bio: null,
  followers: 1,
  following: 1,
  accountCreatedAt: '2020-01-01T00:00:00Z',
  languages: [{ name: 'Rust', percentage: 100 }],
  involvedRepos: [],
  mostStarredRepo: null,
  collaborators: [],
  totalContributions: 10,
  totalCommits: 8,
  totalStars: 0,
  totalRepos: 1,
  totalPrs: 1,
  totalIssues: 1,
}

beforeEach(() => {
  storedEntries.clear()
  redisState.isConfigured = true
})

describe('readme stats cache', () => {
  test('reads back an entry it wrote, whatever the username casing', async () => {
    await cacheReadmeEntry('OctoCat', { stats: STATS, avatarDataUri: 'data:image/png;base64,' })

    expect(await getCachedReadmeEntry(' octocat ')).toEqual({
      stats: STATS,
      avatarDataUri: 'data:image/png;base64,',
    })
  })

  test('treats a malformed entry as a miss', async () => {
    await cacheReadmeEntry('octocat', { stats: STATS, avatarDataUri: '' })
    storedEntries.forEach((_, key) => storedEntries.set(key, { stats: 'broken' }))

    expect(await getCachedReadmeEntry('octocat')).toBeNull()
  })

  test('lets only one concurrent view take the refresh lock', async () => {
    expect(await acquireRefreshLock('octocat')).toBe(true)
    expect(await acquireRefreshLock('octocat')).toBe(false)
  })

  test('degrades to a miss and an open lock without Redis', async () => {
    redisState.isConfigured = false

    expect(await getCachedReadmeEntry('octocat')).toBeNull()
    expect(await acquireRefreshLock('octocat')).toBe(true)
  })
})
