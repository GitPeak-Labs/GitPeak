import type { LegendRow } from '$lib/entities/github-stats/model/language-slices'
import { monoNameBudget, wrapName } from '$lib/shared/lib/legend-fit'
import { startOffsets } from '$lib/shared/lib/start-offsets'

const MARGIN_UNITS = 6
const COLUMN_GAP_UNITS = 6
const LEFT_COLUMN_SHARE = 0.38
const NAME_BASELINE_UNITS = 4.4
const HANDLE_GAP_UNITS = 2.1
const BRAND_BASELINE_UNITS = 1.6
const RULE_GAP_UNITS = 2.6
const BODY_GAP_UNITS = 3
const BODY_BOTTOM_INSET_UNITS = 2
const STAT_COLUMN_COUNT = 2
const STAT_ROW_STEP_UNITS = 8.6
const STAT_LABEL_TO_VALUE_UNITS = 3
const STATS_TOP_GAP_UNITS = 2
const TOP_REPO_VALUE_INSET_UNITS = 0.4
const TOP_REPO_LABEL_ABOVE_VALUE_UNITS = 3.4
const OUTER_RADIUS_UNITS = 16.5
const INNER_TO_OUTER_RADIUS = 0.63
const LEGEND_GAP_UNITS = 4
const LEGEND_WIDTH_UNITS = 11
const LEGEND_MAX_HEIGHT_IN_RADII = 1.9
const MAX_LEGEND_ROW_STEP_UNITS = 2.3
const MAX_LEGEND_FONT_UNITS = 1.1
const MIN_LEGEND_FONT_UNITS = 0.55
const LEGEND_FONT_TO_ROW_STEP = 0.7
const LEGEND_LINE_HEIGHT_EM = 1.35
const LEGEND_DOT_RISE_EM = 0.32
const LEGEND_DOT_RADIUS_EM = 0.36
const NAME_FONT_UNITS = 4.2
const HANDLE_FONT_UNITS = 1.15
const BRAND_FONT_UNITS = 1.4
const STAT_LABEL_FONT_UNITS = 0.95
const STAT_VALUE_FONT_UNITS = 2.9
const TOP_REPO_NAME_FONT_UNITS = 1.9
const TOP_REPO_STARS_FONT_UNITS = 1.5
const TOP_REPO_STARS_GAP_UNITS = 0.8
const HAIRLINE_UNITS = 0.06

type LandscapeInput = {
  width: number
  height: number
  scaleUnit: number
}

type LandscapeFrame = {
  contentX: number
  contentY: number
  contentWidth: number
  leftColumnWidth: number
  rightColumnX: number
  rightColumnWidth: number
  dividerX: number
}

type LandscapeLayout = LandscapeFrame & {
  nameBaselineY: number
  handleBaselineY: number
  brandBaselineY: number
  ruleY: number
  bodyTop: number
  bodyBottom: number
  statsTop: number
  topRepoLabelY: number
  topRepoValueY: number
  outerRadius: number
  innerRadius: number
  donutCenterX: number
  donutCenterY: number
  legendX: number
  legendWidth: number
  hairlineWidth: number
  nameFontSize: number
  handleFontSize: number
  brandFontSize: number
  statLabelFontSize: number
  statValueFontSize: number
  topRepoNameFontSize: number
  topRepoStarsFontSize: number
  topRepoStarsGap: number
}

type LegendMetrics = {
  rowStep: number
  fontSize: number
  lineHeight: number
}

type PlacedLegendRow = LegendRow & {
  nameLines: string[]
  baselineY: number
  dotY: number
  dotRadius: number
}

type PlacedLegend = LegendMetrics & { rows: PlacedLegendRow[] }

type PlacedStat<Stat> = Stat & { x: number; labelY: number; valueY: number }

function landscapeFrame({ width, scaleUnit }: LandscapeInput): LandscapeFrame {
  const margin = scaleUnit * MARGIN_UNITS
  const contentWidth = width - margin * 2
  const columnGap = scaleUnit * COLUMN_GAP_UNITS
  const leftColumnWidth = contentWidth * LEFT_COLUMN_SHARE
  return {
    contentX: margin,
    contentY: margin,
    contentWidth,
    leftColumnWidth,
    rightColumnX: margin + leftColumnWidth + columnGap,
    rightColumnWidth: contentWidth - leftColumnWidth - columnGap,
    dividerX: margin + leftColumnWidth + columnGap / 2,
  }
}

function donutPlacement(frame: LandscapeFrame, unit: number, bodyCenterY: number) {
  const outerRadius = unit * OUTER_RADIUS_UNITS
  const legendGap = unit * LEGEND_GAP_UNITS
  const legendWidth = unit * LEGEND_WIDTH_UNITS
  const heroGroupWidth = outerRadius * 2 + legendGap + legendWidth
  const heroLeftX = frame.rightColumnX + Math.max(0, (frame.rightColumnWidth - heroGroupWidth) / 2)
  const donutCenterX = heroLeftX + outerRadius
  return {
    outerRadius,
    innerRadius: outerRadius * INNER_TO_OUTER_RADIUS,
    donutCenterX,
    donutCenterY: bodyCenterY,
    legendX: donutCenterX + outerRadius + legendGap,
    legendWidth,
  }
}

function fontSizes(unit: number) {
  return {
    hairlineWidth: unit * HAIRLINE_UNITS,
    nameFontSize: unit * NAME_FONT_UNITS,
    handleFontSize: unit * HANDLE_FONT_UNITS,
    brandFontSize: unit * BRAND_FONT_UNITS,
    statLabelFontSize: unit * STAT_LABEL_FONT_UNITS,
    statValueFontSize: unit * STAT_VALUE_FONT_UNITS,
    topRepoNameFontSize: unit * TOP_REPO_NAME_FONT_UNITS,
    topRepoStarsFontSize: unit * TOP_REPO_STARS_FONT_UNITS,
    topRepoStarsGap: unit * TOP_REPO_STARS_GAP_UNITS,
  }
}

export function layoutLandscape(input: LandscapeInput): LandscapeLayout {
  const unit = input.scaleUnit
  const frame = landscapeFrame(input)
  const nameBaselineY = frame.contentY + unit * NAME_BASELINE_UNITS
  const handleBaselineY = nameBaselineY + unit * HANDLE_GAP_UNITS
  const ruleY = handleBaselineY + unit * RULE_GAP_UNITS
  const bodyTop = ruleY + unit * BODY_GAP_UNITS
  const bodyBottom = input.height - frame.contentY - unit * BODY_BOTTOM_INSET_UNITS
  const topRepoValueY = bodyBottom - unit * TOP_REPO_VALUE_INSET_UNITS

  return {
    ...frame,
    ...donutPlacement(frame, unit, (bodyTop + bodyBottom) / 2),
    ...fontSizes(unit),
    nameBaselineY,
    handleBaselineY,
    brandBaselineY: frame.contentY + unit * BRAND_BASELINE_UNITS,
    ruleY,
    bodyTop,
    bodyBottom,
    statsTop: bodyTop + unit * STATS_TOP_GAP_UNITS,
    topRepoLabelY: topRepoValueY - unit * TOP_REPO_LABEL_ABOVE_VALUE_UNITS,
    topRepoValueY,
  }
}

function legendMetrics(rowCount: number, layout: LandscapeLayout, unit: number): LegendMetrics {
  const maxHeight = layout.outerRadius * LEGEND_MAX_HEIGHT_IN_RADII
  const rowStep =
    rowCount > 1 ? Math.min(unit * MAX_LEGEND_ROW_STEP_UNITS, maxHeight / (rowCount - 1)) : 0
  const fontSize = Math.min(
    unit * MAX_LEGEND_FONT_UNITS,
    Math.max(rowStep * LEGEND_FONT_TO_ROW_STEP, unit * MIN_LEGEND_FONT_UNITS),
  )
  return { rowStep, fontSize, lineHeight: fontSize * LEGEND_LINE_HEIGHT_EM }
}

export function placeLandscapeLegend(
  rows: LegendRow[],
  layout: LandscapeLayout,
  unit: number,
): PlacedLegend {
  const metrics = legendMetrics(rows.length, layout, unit)
  const nameLinesPerRow = rows.map((row) =>
    wrapName(row.name, monoNameBudget(layout.legendWidth - unit, metrics.fontSize, row.percentage)),
  )
  const extraHeights = nameLinesPerRow.map(
    (nameLines) => (nameLines.length - 1) * metrics.lineHeight,
  )
  const offsets = startOffsets(extraHeights.map((extraHeight) => metrics.rowStep + extraHeight))
  const span = rows.length ? (offsets.at(-1) ?? 0) + (extraHeights.at(-1) ?? 0) : 0
  const startY = layout.donutCenterY - span / 2

  return {
    ...metrics,
    rows: rows.map((row, index) => {
      const baselineY = startY + offsets[index]
      return {
        ...row,
        nameLines: nameLinesPerRow[index],
        baselineY,
        dotY: baselineY - metrics.fontSize * LEGEND_DOT_RISE_EM,
        dotRadius: metrics.fontSize * LEGEND_DOT_RADIUS_EM,
      }
    }),
  }
}

export function placeLandscapeStats<Stat>(
  stats: Stat[],
  layout: LandscapeLayout,
  unit: number,
): PlacedStat<Stat>[] {
  const columnWidth = layout.leftColumnWidth / STAT_COLUMN_COUNT
  return stats.map((stat, index) => {
    const labelY =
      layout.statsTop + Math.floor(index / STAT_COLUMN_COUNT) * unit * STAT_ROW_STEP_UNITS
    return {
      ...stat,
      x: layout.contentX + (index % STAT_COLUMN_COUNT) * columnWidth,
      labelY,
      valueY: labelY + unit * STAT_LABEL_TO_VALUE_UNITS,
    }
  })
}
