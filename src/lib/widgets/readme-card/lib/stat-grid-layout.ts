import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import { detailItems, heroItems } from '$lib/entities/github-stats/model/stat-items'

const HERO_ROW_HEIGHT_SHARE = 0.36
const MAX_HERO_ROW_HEIGHT = 180
const ROW_GAP = 14
const COLUMN_GAP = 16
const COLUMN_COUNT = 2
const DETAIL_ROW_COUNT = 2
const EXCLUDED_DETAIL_LABEL = 'Followers'

const LABEL_BASELINE_RATIO = 0.29
const COUNT_BASELINE_RATIO = 0.71
const BAR_OFFSET_RATIO = 0.82
const COUNT_FONT_SIZE_RATIO = 0.41
const BAR_HEIGHT_RATIO = 0.036
const BAR_WIDTH_RATIO = 0.2
const CORNER_RADIUS_RATIO = 0.14
const INSET_RATIO = 0.18
const MIN_BAR_HEIGHT = 2

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

type CardTypography = {
  labelBaselineY: number
  countBaselineY: number
  countFontSize: number
  barOffsetY: number
  barWidth: number
  barHeight: number
  cornerRadius: number
  inset: number
}

type StatCardLayout = GridBounds &
  CardTypography & {
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

function cardTypography(width: number, height: number): CardTypography {
  return {
    labelBaselineY: Math.round(height * LABEL_BASELINE_RATIO),
    countBaselineY: Math.round(height * COUNT_BASELINE_RATIO),
    countFontSize: Math.round(height * COUNT_FONT_SIZE_RATIO),
    barOffsetY: Math.round(height * BAR_OFFSET_RATIO),
    barWidth: Math.round(width * BAR_WIDTH_RATIO),
    barHeight: Math.max(MIN_BAR_HEIGHT, Math.round(height * BAR_HEIGHT_RATIO)),
    cornerRadius: Math.round(height * CORNER_RADIUS_RATIO),
    inset: Math.round(height * INSET_RATIO),
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

  const heroCards = heroItems(statistics).map((statItem, index) => {
    const cell = gridCell(bounds, index, heroHeight)
    return {
      ...cell,
      ...cardTypography(cell.width, cell.height),
      label: statItem.label,
      count: statItem.count,
      accentColor: theme[statItem.accentVar],
      isHero: true,
    }
  })
  const detailCards = detailItems(statistics)
    .filter((statItem) => statItem.label !== EXCLUDED_DETAIL_LABEL)
    .map((statItem, index) => {
      const cell = gridCell(detailBounds, index, detailHeight)
      return {
        ...cell,
        ...cardTypography(cell.width, cell.height),
        label: statItem.label,
        count: statItem.count,
        accentColor: theme[statItem.accentVar],
        isHero: false,
      }
    })

  return [...heroCards, ...detailCards]
}
