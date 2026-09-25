import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import { detailItems, heroItems } from '$lib/entities/github-stats/model/stat-items'

const HERO_ROW_HEIGHT_SHARE = 0.36
const MAX_HERO_ROW_HEIGHT = 112
const ROW_GAP = 14
const COLUMN_GAP = 16
const COLUMN_COUNT = 2
const DETAIL_ROW_COUNT = 2
const EXCLUDED_DETAIL_LABEL = 'Followers'

type GridBounds = {
  x: number
  y: number
  width: number
  height: number
}

type StatGridInput = {
  statistics: GithubStats
  theme: ThemeTokens
  bounds: GridBounds
}

type StatCardLayout = GridBounds & {
  label: string
  count: number
  accentColor: string
  isHero: boolean
}

function gridCell(bounds: GridBounds, cellIndex: number, rowHeight: number): GridBounds {
  const columnWidth = (bounds.width - COLUMN_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT
  const column = cellIndex % COLUMN_COUNT
  const row = Math.floor(cellIndex / COLUMN_COUNT)
  return {
    x: bounds.x + column * (columnWidth + COLUMN_GAP),
    y: bounds.y + row * (rowHeight + ROW_GAP),
    width: columnWidth,
    height: rowHeight,
  }
}

export function layoutStatGrid({ statistics, theme, bounds }: StatGridInput): StatCardLayout[] {
  const heroHeight = Math.min(
    Math.round(bounds.height * HERO_ROW_HEIGHT_SHARE),
    MAX_HERO_ROW_HEIGHT,
  )
  const detailTop = bounds.y + heroHeight + ROW_GAP
  const detailHeight =
    (bounds.y + bounds.height - detailTop - ROW_GAP * (DETAIL_ROW_COUNT - 1)) / DETAIL_ROW_COUNT
  const detailBounds = { ...bounds, y: detailTop }

  const heroCards = heroItems(statistics).map((statItem, index) => ({
    ...gridCell(bounds, index, heroHeight),
    label: statItem.label,
    count: statItem.count,
    accentColor: theme[statItem.accentVar],
    isHero: true,
  }))
  const detailCards = detailItems(statistics)
    .filter((statItem) => statItem.label !== EXCLUDED_DETAIL_LABEL)
    .map((statItem, index) => ({
      ...gridCell(detailBounds, index, detailHeight),
      label: statItem.label,
      count: statItem.count,
      accentColor: theme[statItem.accentVar],
      isHero: false,
    }))

  return [...heroCards, ...detailCards]
}
