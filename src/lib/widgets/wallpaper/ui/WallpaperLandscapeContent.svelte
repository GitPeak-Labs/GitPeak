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
    layoutLandscape,
    placeLandscapeLegend,
    placeLandscapeStats,
  } from '../lib/landscape-layout'
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

  const MAX_NAME_CHARS = 24
  const STAR_CAPABLE_FONT_STYLE = "font-family:'Noto Serif JP'"
  const FOLDED_ROW_OPACITY = 0.6
  const LEGEND_NAME_OPACITY = 0.9

  const displayName = $derived(wrapName(statistics.displayName || username, MAX_NAME_CHARS, 1)[0])
  const nameFontStyle = $derived(containsCjk(displayName) ? STAR_CAPABLE_FONT_STYLE : undefined)
  const allSlices = $derived(buildThemedSlices(statistics.languages, theme))
  const legendRows = $derived(legendRowsFor(groupSlicesForLegend(allSlices), theme.muted))
  const topRepo = $derived(statistics.mostStarredRepo)
  const layout = $derived(layoutLandscape({ width, height, scaleUnit }))
  const legend = $derived(placeLandscapeLegend(legendRows, layout, scaleUnit))
  const placedStats = $derived(
    placeLandscapeStats(buildWallpaperStats(statistics, theme), layout, scaleUnit),
  )
</script>

<text
  x={layout.contentX}
  y={layout.nameBaselineY}
  class="text-serif"
  font-size={layout.nameFontSize}
  font-weight="700"
  style={nameFontStyle}
>
  {displayName}
</text>
<text
  x={layout.contentX}
  y={layout.handleBaselineY}
  class="text-main"
  font-size={layout.handleFontSize}
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
<line
  x1={layout.dividerX}
  y1={layout.bodyTop}
  x2={layout.dividerX}
  y2={layout.bodyBottom}
  stroke={theme.muted}
  stroke-opacity="0.18"
  stroke-width={layout.hairlineWidth}
/>

<text
  x={layout.contentX + layout.contentWidth}
  y={layout.brandBaselineY}
  class="text-serif"
  font-size={layout.brandFontSize}
  text-anchor="end"
  style="fill:url('#brand-gradient')"
>
  GitPeak
</text>

{#if allSlices.length}
  <WallpaperDonut
    slices={allSlices}
    {theme}
    {avatarDataUri}
    centerX={layout.donutCenterX}
    centerY={layout.donutCenterY}
    outerRadius={layout.outerRadius}
    innerRadius={layout.innerRadius}
    filterId="wp-donut-glow-ls"
  />

  {#each legend.rows as legendRow (legendRow.name)}
    <circle
      cx={layout.legendX}
      cy={legendRow.dotY}
      r={legendRow.dotRadius}
      fill={legendRow.color}
      opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : 1}
    />
    {#each legendRow.nameLines as nameLine, lineIndex (lineIndex)}
      <text
        x={layout.legendX + scaleUnit}
        y={legendRow.baselineY + lineIndex * legend.lineHeight}
        class="text-main"
        font-size={legend.fontSize}
        opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : LEGEND_NAME_OPACITY}
      >
        {nameLine}
      </text>
    {/each}
    <text
      x={layout.legendX + layout.legendWidth}
      y={legendRow.baselineY}
      class="text-main"
      font-size={legend.fontSize}
      font-weight="600"
      text-anchor="end"
      opacity={legendRow.isFoldedRemainder ? FOLDED_ROW_OPACITY : 1}
      style="fill:{legendRow.color}"
    >
      {legendRow.percentage}%
    </text>
  {/each}
{/if}

{#each placedStats as stat (stat.label)}
  <text
    x={stat.x}
    y={stat.labelY}
    class="text-main"
    font-size={layout.statLabelFontSize}
    letter-spacing="0.14em"
    font-weight="600"
    opacity="0.8"
  >
    {stat.label.toUpperCase()}
  </text>
  <text
    x={stat.x}
    y={stat.valueY}
    class="text-serif"
    font-size={layout.statValueFontSize}
    font-weight="700"
    style="fill:{stat.color}"
  >
    {stat.countLabel}
  </text>
{/each}

{#if topRepo}
  <text
    x={layout.contentX}
    y={layout.topRepoLabelY}
    class="text-main"
    font-size={layout.statLabelFontSize}
    letter-spacing="0.14em"
    font-weight="600"
    opacity="0.8"
  >
    TOP REPOSITORY
  </text>
  <text
    x={layout.contentX}
    y={layout.topRepoValueY}
    class="text-serif"
    font-size={layout.topRepoNameFontSize}
    font-weight="700"
    style={STAR_CAPABLE_FONT_STYLE}
  >
    {topRepo.name}
    <tspan fill={theme.gold} dx={layout.topRepoStarsGap} font-size={layout.topRepoStarsFontSize}
      >★ {formatNumber(topRepo.stars)}</tspan
    >
  </text>
{/if}
