import type { LegendRow } from '$lib/entities/github-stats/model/language-slices'
import { fitLegendName } from '$lib/shared/lib/legend-fit'

const STATUS_BAR_CLEARANCE_UNITS = 9
const HOME_INDICATOR_CLEARANCE_UNITS = 6
const SIDE_MARGIN_UNITS = 6
const MIN_BLOCK_GAP_UNITS = 3.6
const BRAND_TO_NAME_GAP_UNITS = 2.2
const BRAND_HEIGHT_UNITS = 7.5
const NAME_HEIGHT_UNITS = 5
const HANDLE_HEIGHT_UNITS = 1.8
const OUTER_RADIUS_UNITS = 22
const INNER_TO_OUTER_RADIUS = 0.63
const LEGEND_COLUMN_COUNT = 2
const LEGEND_SIDE_PADDING_UNITS = 2
const LEGEND_MAX_HEIGHT_IN_RADII = 1.5
const MAX_LEGEND_ROW_STEP_UNITS = 4
const MAX_LEGEND_FONT_UNITS = 1.9
const MIN_LEGEND_FONT_UNITS = 0.9
const LEGEND_FONT_TO_ROW_STEP = 0.55
const LEGEND_TRAILING_UNITS = 1.5
const LEGEND_TOP_EXTRA_UNITS = 1.2
const LEGEND_DOT_RISE_EM = 0.32
const LEGEND_DOT_RADIUS_EM = 0.4
const LEGEND_TEXT_INSET_UNITS = 1.6
const TOP_REPO_BLOCK_UNITS = 14
const TOP_REPO_RULE_GAP_UNITS = 5.5
const TOP_REPO_LABEL_GAP_UNITS = 3
const TOP_REPO_VALUE_GAP_UNITS = 4.8
const TOP_REPO_TRAILING_UNITS = 3.2
const TOP_REPO_RULE_START_SHARE = 0.3
const TOP_REPO_RULE_END_SHARE = 0.7
const TOP_REPO_LABEL_FONT_UNITS = 2.1
const TOP_REPO_NAME_FONT_UNITS = 3.6
const TOP_REPO_STARS_FONT_UNITS = 2.8
const STAT_COLUMN_COUNT = 3
const STAT_VALUE_FONT_UNITS = 7.2
const STAT_LABEL_FONT_UNITS = 2
const STAT_LABEL_OFFSET_UNITS = 1.8
const STAT_VALUE_OFFSET_UNITS = 8.2
const STAT_ROW_STEP_UNITS = 12
const STACK_FILL_SHARE = 0.9
const FLEXIBLE_GAP_COUNT = 5
const BRAND_BASELINE_SHARE = 0.7
const NAME_BASELINE_SHARE = 0.75
const HANDLE_LINE_HEIGHT = 1.2
const HANDLE_GAP_UNITS = 1.2
const RULE_GAP_SHARE = 0.55
const HAIRLINE_UNITS = 0.06

type PortraitInput = {
  width: number
  height: number
  scaleUnit: number
  legendRowCount: number
  hasTopRepo: boolean
}

type PortraitSizes = {
  brandHeight: number
  nameHeight: number
  handleHeight: number
  outerRadius: number
  innerRadius: number
  legendRowStep: number
  legendFontSize: number
  legendHeight: number
  statGridHeight: number
}

type StackPlacement = { top: number; gap: number }

type HeaderPositions = {
  brandBaselineY: number
  nameBaselineY: number
  handleBaselineY: number
  ruleY: number
  donutCenterY: number
}

type LowerPositions = {
  legendStartY: number
  topRepoRuleY: number
  topRepoLabelY: number
  topRepoValueY: number
  statGridY: number
}

type PortraitLayout = PortraitSizes &
  HeaderPositions &
  LowerPositions & {
    contentX: number
    contentWidth: number
    centerX: number
    hairlineWidth: number
    topRepoRuleStartX: number
    topRepoRuleEndX: number
    topRepoLabelFontSize: number
    topRepoNameFontSize: number
    topRepoStarsFontSize: number
    topRepoStarsGap: number
    statValueFontSize: number
    statLabelFontSize: number
  }

type PlacedLegendRow = LegendRow & {
  baselineY: number
  dotX: number
  dotY: number
  dotRadius: number
  nameX: number
  percentX: number
  nameLabel: string
}

type PlacedStat<Stat> = Stat & { centerX: number; labelY: number; valueY: number }

function portraitSizes(scaleUnit: number, legendGridRowCount: number): PortraitSizes {
  const outerRadius = scaleUnit * OUTER_RADIUS_UNITS
  const legendRowStep =
    legendGridRowCount > 1
      ? Math.min(
          scaleUnit * MAX_LEGEND_ROW_STEP_UNITS,
          (outerRadius * LEGEND_MAX_HEIGHT_IN_RADII) / (legendGridRowCount - 1),
        )
      : 0
  const legendFontSize = Math.min(
    scaleUnit * MAX_LEGEND_FONT_UNITS,
    Math.max(legendRowStep * LEGEND_FONT_TO_ROW_STEP, scaleUnit * MIN_LEGEND_FONT_UNITS),
  )
  return {
    brandHeight: scaleUnit * BRAND_HEIGHT_UNITS,
    nameHeight: scaleUnit * NAME_HEIGHT_UNITS,
    handleHeight: scaleUnit * HANDLE_HEIGHT_UNITS,
    outerRadius,
    innerRadius: outerRadius * INNER_TO_OUTER_RADIUS,
    legendRowStep,
    legendFontSize,
    legendHeight:
      Math.max(0, legendGridRowCount - 1) * legendRowStep + scaleUnit * LEGEND_TRAILING_UNITS,
    statGridHeight: scaleUnit * (STAT_ROW_STEP_UNITS + STAT_VALUE_OFFSET_UNITS),
  }
}

function stackTop(input: PortraitInput, sizes: PortraitSizes): StackPlacement {
  const contentTop = input.scaleUnit * STATUS_BAR_CLEARANCE_UNITS
  const contentHeight = input.height - input.scaleUnit * HOME_INDICATOR_CLEARANCE_UNITS - contentTop
  const elementsHeight =
    sizes.brandHeight +
    sizes.nameHeight +
    sizes.handleHeight +
    sizes.outerRadius * 2 +
    sizes.legendHeight +
    (input.hasTopRepo ? input.scaleUnit * TOP_REPO_BLOCK_UNITS : 0) +
    sizes.statGridHeight +
    input.scaleUnit * BRAND_TO_NAME_GAP_UNITS
  const gap = Math.max(
    input.scaleUnit * MIN_BLOCK_GAP_UNITS,
    (contentHeight * STACK_FILL_SHARE - elementsHeight) / FLEXIBLE_GAP_COUNT,
  )
  const stackHeight = elementsHeight + gap * FLEXIBLE_GAP_COUNT
  return { top: contentTop + Math.max(0, (contentHeight - stackHeight) / 2), gap }
}

function headerPositions(
  unit: number,
  sizes: PortraitSizes,
  stack: StackPlacement,
): HeaderPositions {
  const nameBaselineY =
    stack.top +
    sizes.brandHeight +
    unit * BRAND_TO_NAME_GAP_UNITS +
    sizes.nameHeight * NAME_BASELINE_SHARE
  const handleBaselineY =
    nameBaselineY + sizes.handleHeight * HANDLE_LINE_HEIGHT + unit * HANDLE_GAP_UNITS
  return {
    brandBaselineY: stack.top + sizes.brandHeight * BRAND_BASELINE_SHARE,
    nameBaselineY,
    handleBaselineY,
    ruleY: handleBaselineY + stack.gap * RULE_GAP_SHARE,
    donutCenterY: handleBaselineY + stack.gap + sizes.outerRadius,
  }
}

function lowerPositions(
  input: PortraitInput,
  sizes: PortraitSizes,
  anchor: { donutBottomY: number; gap: number },
): LowerPositions {
  const { donutBottomY, gap } = anchor
  const unit = input.scaleUnit
  const legendGridRowCount = Math.ceil(input.legendRowCount / LEGEND_COLUMN_COUNT)
  const legendStartY = donutBottomY + gap + unit * LEGEND_TOP_EXTRA_UNITS
  const legendEndY = legendStartY + Math.max(0, legendGridRowCount - 1) * sizes.legendRowStep
  const topRepoRuleY = legendEndY + unit * TOP_REPO_RULE_GAP_UNITS
  const topRepoLabelY = topRepoRuleY + unit * TOP_REPO_LABEL_GAP_UNITS
  const topRepoValueY = topRepoLabelY + unit * TOP_REPO_VALUE_GAP_UNITS
  const statsAnchorY = input.hasTopRepo
    ? topRepoValueY + unit * TOP_REPO_TRAILING_UNITS
    : legendEndY + unit * LEGEND_TRAILING_UNITS
  return { legendStartY, topRepoRuleY, topRepoLabelY, topRepoValueY, statGridY: statsAnchorY + gap }
}

export function layoutPortrait(input: PortraitInput): PortraitLayout {
  const unit = input.scaleUnit
  const contentX = unit * SIDE_MARGIN_UNITS
  const contentWidth = input.width - contentX * 2
  const sizes = portraitSizes(unit, Math.ceil(input.legendRowCount / LEGEND_COLUMN_COUNT))
  const stack = stackTop(input, sizes)
  const header = headerPositions(unit, sizes, stack)
  const lower = lowerPositions(input, sizes, {
    donutBottomY: header.donutCenterY + sizes.outerRadius,
    gap: stack.gap,
  })

  return {
    ...sizes,
    ...header,
    ...lower,
    contentX,
    contentWidth,
    centerX: contentX + contentWidth / 2,
    hairlineWidth: unit * HAIRLINE_UNITS,
    topRepoRuleStartX: contentX + contentWidth * TOP_REPO_RULE_START_SHARE,
    topRepoRuleEndX: contentX + contentWidth * TOP_REPO_RULE_END_SHARE,
    topRepoLabelFontSize: unit * TOP_REPO_LABEL_FONT_UNITS,
    topRepoNameFontSize: unit * TOP_REPO_NAME_FONT_UNITS,
    topRepoStarsFontSize: unit * TOP_REPO_STARS_FONT_UNITS,
    topRepoStarsGap: unit,
    statValueFontSize: unit * STAT_VALUE_FONT_UNITS,
    statLabelFontSize: unit * STAT_LABEL_FONT_UNITS,
  }
}

export function placePortraitLegendRows(
  rows: LegendRow[],
  layout: PortraitLayout,
  unit: number,
): PlacedLegendRow[] {
  const columnWidth = layout.contentWidth / LEGEND_COLUMN_COUNT
  const sidePadding = unit * LEGEND_SIDE_PADDING_UNITS
  const textInset = unit * LEGEND_TEXT_INSET_UNITS
  return rows.map((row, index) => {
    const columnX = layout.contentX + (index % LEGEND_COLUMN_COUNT) * columnWidth
    const baselineY =
      layout.legendStartY + Math.floor(index / LEGEND_COLUMN_COUNT) * layout.legendRowStep
    return {
      ...row,
      baselineY,
      dotX: columnX + sidePadding,
      dotY: baselineY - layout.legendFontSize * LEGEND_DOT_RISE_EM,
      dotRadius: layout.legendFontSize * LEGEND_DOT_RADIUS_EM,
      nameX: columnX + sidePadding + textInset,
      percentX: columnX + columnWidth - sidePadding,
      nameLabel: fitLegendName({
        name: row.name,
        percentage: row.percentage,
        rowWidth: columnWidth - sidePadding * 2 - textInset,
        fontSize: layout.legendFontSize,
      }),
    }
  })
}

export function placePortraitStats<Stat>(
  stats: Stat[],
  layout: PortraitLayout,
  unit: number,
): PlacedStat<Stat>[] {
  const columnWidth = layout.contentWidth / STAT_COLUMN_COUNT
  return stats.map((stat, index) => {
    const rowY =
      layout.statGridY + Math.floor(index / STAT_COLUMN_COUNT) * unit * STAT_ROW_STEP_UNITS
    return {
      ...stat,
      centerX: layout.contentX + (index % STAT_COLUMN_COUNT) * columnWidth + columnWidth / 2,
      labelY: rowY + unit * STAT_LABEL_OFFSET_UNITS,
      valueY: rowY + unit * STAT_VALUE_OFFSET_UNITS,
    }
  })
}
