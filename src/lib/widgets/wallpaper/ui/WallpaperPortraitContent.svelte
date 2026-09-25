<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { formatNumber } from '$lib/shared/lib/number-formatting'
  import { accountAge } from '$lib/entities/github-stats/model/account-age'
  import {
    buildThemedSlices,
    groupSlicesForLegend,
    legendRowsFor,
  } from '$lib/entities/github-stats/model/language-slices'
  import { wrapName } from '$lib/shared/lib/legend-fit'
  import { containsCjk } from '$lib/shared/lib/script-segments'
  import {
    layoutPortrait,
    placePortraitLegendRows,
    placePortraitStats,
  } from '../lib/portrait-layout'
  import { buildWallpaperStats } from '../lib/wallpaper-stats'
  import WallpaperDonut from './WallpaperDonut.svelte'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
    width,
    height,
    scaleUnit,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
    width: number
    height: number
    scaleUnit: number
  } = $props()

  const MAX_NAME_CHARS = 22
  const CJK_CAPABLE_FONT = "'Noto Serif JP'"
  const STAR_CAPABLE_FONT_STYLE = `font-family:${CJK_CAPABLE_FONT}`
  const FOLDED_ROW_OPACITY = 0.6
  const LEGEND_NAME_OPACITY = 0.9

  const displayName = $derived(wrapName(statistics.displayName || username, MAX_NAME_CHARS, 1)[0])
  const nameFontStyle = $derived(containsCjk(displayName) ? STAR_CAPABLE_FONT_STYLE : undefined)
  const allSlices = $derived(buildThemedSlices(statistics.languages, theme))
  const legendRows = $derived(legendRowsFor(groupSlicesForLegend(allSlices), theme.muted))
  const topRepo = $derived(statistics.mostStarredRepo)
  const layout = $derived(
    layoutPortrait({
      width,
      height,
      scaleUnit,
      legendRowCount: legendRows.length,
      hasTopRepo: topRepo !== null,
    }),
  )
  const placedLegendRows = $derived(placePortraitLegendRows(legendRows, layout, scaleUnit))
  const placedStats = $derived(
    placePortraitStats(buildWallpaperStats(statistics, theme), layout, scaleUnit),
  )
</script>

<text
  x={layout.centerX}
  y={layout.brandBaselineY}
  class="text-serif"
  font-size={layout.brandHeight}
  text-anchor="middle"
  style="fill:url('#brand-gradient')"
>
  GitPeak
</text>

<text
  x={layout.centerX}
  y={layout.nameBaselineY}
  class="text-serif"
  font-size={layout.nameHeight}
  font-weight="700"
  text-anchor="middle"
  style={nameFontStyle}
>
  {displayName}
</text>
<text
  x={layout.centerX}
  y={layout.handleBaselineY}
  class="text-main"
  font-size={layout.handleHeight}
  text-anchor="middle"
  opacity="0.85"
  style="fill:{theme.subtle}"
>
  @{username} · {accountAge(statistics.accountCreatedAt)} on GitHub
</text>

<line
  x1={layout.contentX}
  y1={layout.ruleY}
  x2={layout.contentX + layout.contentWidth}
  y2={layout.ruleY}
  stroke={theme.muted}
  stroke-opacity="0.25"
  stroke-width={layout.hairlineWidth}
/>

{#if allSlices.length}
  <WallpaperDonut
    slices={allSlices}
    {theme}
    {avatarDataUri}
    centerX={layout.centerX}
    centerY={layout.donutCenterY}
    outerRadius={layout.outerRadius}
    innerRadius={layout.innerRadius}
    filterId="wp-donut-glow-pt"
  />

  {#each placedLegendRows as legendRow (legendRow.name)}
    <circle
      cx={legendRow.dotX}
      cy={legendRow.dotY}
      r={legendRow.dotRadius}
      fill={legendRow.color}
      opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : 1}
    />
    <text
      x={legendRow.nameX}
      y={legendRow.baselineY}
      class="text-main"
      font-size={layout.legendFontSize}
      opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : LEGEND_NAME_OPACITY}
    >
      {legendRow.nameLabel}
    </text>
    <text
      x={legendRow.percentX}
      y={legendRow.baselineY}
      class="text-main"
      font-size={layout.legendFontSize}
      font-weight="600"
      text-anchor="end"
      opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : 1}
      style="fill:{legendRow.color}"
    >
      {legendRow.percentage}%
    </text>
  {/each}

  {#if topRepo}
    <line
      x1={layout.topRepoRuleStartX}
      y1={layout.topRepoRuleY}
      x2={layout.topRepoRuleEndX}
      y2={layout.topRepoRuleY}
      stroke={theme.muted}
      stroke-opacity="0.25"
      stroke-width={layout.hairlineWidth}
    />
    <text
      x={layout.centerX}
      y={layout.topRepoLabelY}
      class="text-main"
      font-size={layout.topRepoLabelFontSize}
      letter-spacing="0.14em"
      font-weight="600"
      text-anchor="middle"
      opacity="0.8"
    >
      TOP REPOSITORY
    </text>
    <text
      x={layout.centerX}
      y={layout.topRepoValueY}
      class="text-serif"
      font-size={layout.topRepoNameFontSize}
      font-weight="700"
      text-anchor="middle"
      style={STAR_CAPABLE_FONT_STYLE}
    >
      {topRepo.name}
      <tspan fill={theme.gold} dx={layout.topRepoStarsGap} font-size={layout.topRepoStarsFontSize}
        >★ {formatNumber(topRepo.stars)}</tspan
      >
    </text>
  {/if}
{/if}

{#each placedStats as stat (stat.label)}
  <text
    x={stat.centerX}
    y={stat.labelY}
    class="text-main"
    font-size={layout.statLabelFontSize}
    letter-spacing="0.08em"
    font-weight="600"
    text-anchor="middle"
    style="fill:{theme.subtle}"
  >
    {stat.label.toUpperCase()}
  </text>
  <text
    x={stat.centerX}
    y={stat.valueY}
    class="text-serif"
    font-size={layout.statValueFontSize}
    font-weight="700"
    text-anchor="middle"
    style="fill:{stat.color}"
  >
    {stat.countLabel}
  </text>
{/each}
