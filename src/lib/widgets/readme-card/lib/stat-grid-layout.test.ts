import { describe, expect, test } from 'bun:test'
import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import { PRESET_THEMES } from '$lib/entities/theme/model/theme-manager'
import { layoutStatGrid } from './stat-grid-layout'

const THEME = PRESET_THEMES['Rosé Pine']
const BOUNDS = { x: 500, y: 130, width: 340, height: 274 }
const TALL_GRID_HEIGHT = 442
const MAX_HERO_ROW_HEIGHT = 112

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
  totalContributions: 1000,
  totalCommits: 736,
  totalStars: 58,
  totalRepos: 29,
  totalPrs: 24,
  totalIssues: 30,
}

describe('layoutStatGrid', () => {
  const cards = layoutStatGrid({ statistics: STATS, theme: THEME, bounds: BOUNDS })

  test('leads with contributions and commits, then four smaller cards without followers', () => {
    expect(cards.map((card) => [card.label, card.count, card.isHero])).toEqual([
      ['Contributions', 1000, true],
      ['Commits', 736, true],
      ['Stars', 58, false],
      ['Repos', 29, false],
      ['PRs', 24, false],
      ['Issues', 30, false],
    ])
  })

  test('keeps every card inside the bounds', () => {
    cards.forEach((card) => {
      expect(card.x).toBeGreaterThanOrEqual(BOUNDS.x)
      expect(card.y).toBeGreaterThanOrEqual(BOUNDS.y)
      expect(card.x + card.width).toBeLessThanOrEqual(BOUNDS.x + BOUNDS.width)
      expect(card.y + card.height).toBeLessThanOrEqual(BOUNDS.y + BOUNDS.height)
    })
  })

  test('makes the hero row taller than a detail row', () => {
    const [heroCard] = cards
    const [detailCard] = cards.toReversed()

    expect(heroCard.height).toBeGreaterThan(detailCard.height)
  })

  test('caps the hero row on a tall grid so the big numbers stay tight to their cards', () => {
    const tallGrid = layoutStatGrid({
      statistics: STATS,
      theme: THEME,
      bounds: { ...BOUNDS, height: TALL_GRID_HEIGHT },
    })

    expect(tallGrid[0].height).toBe(MAX_HERO_ROW_HEIGHT)
  })

  test('lays cards out two to a row without overlap', () => {
    const [firstCard, secondCard] = cards

    expect(secondCard.y).toBe(firstCard.y)
    expect(secondCard.x).toBeGreaterThan(firstCard.x + firstCard.width)
  })

  test('colors each card with its stat accent', () => {
    expect(cards[0].accentColor).toBe(THEME.foam)
    expect(cards[2].accentColor).toBe(THEME.gold)
  })
})
