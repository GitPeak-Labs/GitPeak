import type { GitHubLanguage } from '$lib/entities/github-stats/model/github-stats'
import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
import type { PieSlice } from '$lib/shared/lib/pie-geometry'
import {
  buildThemedSlices,
  groupSlicesForLegend,
  legendRowsFor,
} from '$lib/entities/github-stats/model/language-slices'
import { wrapName } from '$lib/shared/lib/legend-fit'
import { startOffsets } from '$lib/shared/lib/start-offsets'

const MAX_NAMED_LANGUAGES = 7
const MIN_NAMED_PERCENT = 1
const THEME_ACCENT_COUNT = 6
const REPEATED_ACCENT_BLEND_STEP = 0.45
const MAX_REPEATED_ACCENT_BLEND = 0.7
const HEX_RADIX = 16
const HEX_CHANNEL_LENGTH = 2
const HEX_CHANNEL_STARTS = [0, HEX_CHANNEL_LENGTH, HEX_CHANNEL_LENGTH * 2]

export const LEGEND_FONT_SIZE = 12
const LEGEND_NAME_INSET = 16
export const LEGEND_WRAP_LINE_HEIGHT = 15
const MAX_LEGEND_ROW_STEP = 32
const MAX_NAME_LINES = 2
const MONO_ADVANCE_EM = 0.6
const PERCENT_LABEL_CHARS = 4
const NAME_TO_PERCENT_GAP_CHARS = 1
const CAP_HEIGHT_EM = 0.35

export type LegendRow = {
  name: string
  percentLabel: string
  color: string
  isFoldedRemainder: boolean
}

type ReadmeLegend = {
  slices: PieSlice[]
  rows: LegendRow[]
}

type PositionedLegendRow = LegendRow & {
  nameLines: string[]
  baselineY: number
  fontSize: number
  nameInset: number
  wrapLineHeight: number
}

type LegendLayoutInput = {
  rows: LegendRow[]
  legendWidth: number
  centerY: number
  maxSpan: number
  scale: number
}

function parseHexChannels(hexColor: string): number[] {
  const digits = hexColor.replace('#', '')
  return HEX_CHANNEL_STARTS.map((start) =>
    parseInt(digits.slice(start, start + HEX_CHANNEL_LENGTH), HEX_RADIX),
  )
}

function blendHex(color: string, background: string, blendAmount: number): string {
  const colorChannels = parseHexChannels(color)
  const backgroundChannels = parseHexChannels(background)
  const hasInvalidChannel = [...colorChannels, ...backgroundChannels].some(Number.isNaN)
  if (hasInvalidChannel) return color

  const blendedHex = colorChannels
    .map((channel, index) =>
      Math.round(channel + (backgroundChannels[index] - channel) * blendAmount),
    )
    .map((channel) => channel.toString(HEX_RADIX).padStart(HEX_CHANNEL_LENGTH, '0'))
    .join('')
  return `#${blendedHex}`
}

function dimRepeatedAccent(slice: PieSlice, index: number, background: string): PieSlice {
  const accentRound = Math.floor(index / THEME_ACCENT_COUNT)
  if (accentRound === 0) return slice

  const blendAmount = Math.min(REPEATED_ACCENT_BLEND_STEP * accentRound, MAX_REPEATED_ACCENT_BLEND)
  return { ...slice, color: blendHex(slice.color, background, blendAmount) }
}

function toPercentLabel(percentage: number): string {
  return `${Math.round(percentage)}%`
}

export function buildReadmeLegend(languages: GitHubLanguage[], theme: ThemeTokens): ReadmeLegend {
  const slices = buildThemedSlices(languages, theme)
    .filter((slice) => slice.percentage > 0)
    .map((slice, index) => dimRepeatedAccent(slice, index, theme.base))
  const grouping = groupSlicesForLegend(slices, MIN_NAMED_PERCENT, MAX_NAMED_LANGUAGES)

  const rows = legendRowsFor(grouping, theme.muted).map((row) => ({
    name: row.name,
    percentLabel: toPercentLabel(row.percentage),
    color: row.color,
    isFoldedRemainder: row.isFoldedRemainder,
  }))

  return { slices, rows }
}

function legendNameBudget(legendWidth: number, fontSize: number, nameInset: number): number {
  const availableChars = Math.floor((legendWidth - nameInset) / (fontSize * MONO_ADVANCE_EM))
  return availableChars - PERCENT_LABEL_CHARS - NAME_TO_PERCENT_GAP_CHARS
}

function extraLineHeight(nameLines: string[], wrapLineHeight: number): number {
  return (nameLines.length - 1) * wrapLineHeight
}

export function layoutLegendRows(layout: LegendLayoutInput): PositionedLegendRow[] {
  const fontSize = LEGEND_FONT_SIZE * layout.scale
  const nameInset = LEGEND_NAME_INSET * layout.scale
  const wrapLineHeight = LEGEND_WRAP_LINE_HEIGHT * layout.scale
  const maxRowStep = MAX_LEGEND_ROW_STEP * layout.scale

  const nameBudget = legendNameBudget(layout.legendWidth, fontSize, nameInset)
  const nameLinesPerRow = layout.rows.map((row) => wrapName(row.name, nameBudget, MAX_NAME_LINES))
  const totalExtraHeight = nameLinesPerRow.reduce(
    (height, nameLines) => height + extraLineHeight(nameLines, wrapLineHeight),
    0,
  )
  const gapCount = Math.max(layout.rows.length - 1, 1)
  const rowStep = Math.min(maxRowStep, (layout.maxSpan - totalExtraHeight) / gapCount)
  const rowOffsets = startOffsets(
    nameLinesPerRow.map((nameLines) => rowStep + extraLineHeight(nameLines, wrapLineHeight)),
  )

  const lastNameLines = nameLinesPerRow.at(-1) ?? []
  const legendSpan = (rowOffsets.at(-1) ?? 0) + extraLineHeight(lastNameLines, wrapLineHeight)
  const firstBaselineY = layout.centerY - legendSpan / 2 + fontSize * CAP_HEIGHT_EM

  return layout.rows.map((row, index) => ({
    ...row,
    nameLines: nameLinesPerRow[index],
    baselineY: firstBaselineY + rowOffsets[index],
    fontSize,
    nameInset,
    wrapLineHeight,
  }))
}
