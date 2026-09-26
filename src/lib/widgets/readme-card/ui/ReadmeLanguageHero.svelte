<script lang="ts">
  import type { GitHubLanguage } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { generateArcPath } from '$lib/shared/lib/pie-geometry'
  import { buildReadmeLegend, layoutLegendRows } from '../lib/language-legend'
  import {
    SWEEP_BEGIN_SECONDS,
    buildSweepRevealMask,
    sweepRevealDelaySeconds,
  } from '../lib/sweep-reveal-mask'

  let {
    languages,
    theme,
    avatarDataUri,
    x,
    centerY,
    width,
    shouldShowAvatar = true,
  }: {
    languages: GitHubLanguage[]
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    centerY: number
    width: number
    shouldShowAvatar?: boolean
  } = $props()

  const BASE_WIDTH = 404
  const BASE_OUTER_RADIUS = 104
  const BASE_INNER_RADIUS = 66
  const BASE_AVATAR_RADIUS_INSET = 5
  const BASE_SWEEP_MASK_RADIUS_PADDING = 12
  const BASE_LEGEND_GAP = 28
  const BASE_LEGEND_MAX_SPAN_PADDING = 36
  const BASE_LEGEND_DOT_RADIUS = 4
  const LEGEND_ROW_DELAY_SECONDS = 0.5
  const LEGEND_ROW_STAGGER_SECONDS = 0.04
  const FOLDED_ROW_OPACITY = 0.6
  const HOLE_COUNT_FONT_RATIO = 0.85
  const HOLE_LABEL_FONT_RATIO = 0.22
  const HOLE_COUNT_BASELINE_OFFSET_RATIO = -0.08
  const HOLE_LABEL_BASELINE_OFFSET_RATIO = 0.45

  const scale = $derived(width / BASE_WIDTH)
  const outerRadius = $derived(BASE_OUTER_RADIUS * scale)
  const innerRadius = $derived(BASE_INNER_RADIUS * scale)
  const ringThickness = $derived(outerRadius - innerRadius)
  const ringMidlineRadius = $derived((outerRadius + innerRadius) / 2)
  const avatarRadius = $derived(innerRadius - BASE_AVATAR_RADIUS_INSET * scale)
  const sweepMaskRadius = $derived(outerRadius + BASE_SWEEP_MASK_RADIUS_PADDING * scale)
  const legendGap = $derived(BASE_LEGEND_GAP * scale)
  const legendMaxSpan = $derived(outerRadius * 2 + BASE_LEGEND_MAX_SPAN_PADDING * scale)
  const legendDotRadius = $derived(BASE_LEGEND_DOT_RADIUS * scale)

  const centerX = $derived(x + outerRadius)
  const legend = $derived(buildReadmeLegend(languages, theme))
  const legendX = $derived(centerX + outerRadius + legendGap)
  const legendWidth = $derived(x + width - legendX)
  const legendRows = $derived(
    layoutLegendRows({
      rows: legend.rows,
      legendWidth,
      centerY,
      maxSpan: legendMaxSpan,
      scale,
    }),
  )
  const sweepMask = $derived(buildSweepRevealMask({ centerX, centerY, radius: sweepMaskRadius }))
  const holeCountFontSize = $derived(avatarRadius * HOLE_COUNT_FONT_RATIO)
  const holeLabelFontSize = $derived(avatarRadius * HOLE_LABEL_FONT_RATIO)
  const holeCountBaselineY = $derived(centerY + avatarRadius * HOLE_COUNT_BASELINE_OFFSET_RATIO)
  const holeLabelBaselineY = $derived(centerY + avatarRadius * HOLE_LABEL_BASELINE_OFFSET_RATIO)
</script>

<defs>
  <filter id="lang-glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feComponentTransfer in="blur" result="softBlur">
      <feFuncA type="linear" slope="0.55" />
    </feComponentTransfer>
    <feMerge>
      <feMergeNode in="softBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <mask
    id="lang-sweep-mask"
    maskUnits="userSpaceOnUse"
    x={centerX - sweepMaskRadius}
    y={centerY - sweepMaskRadius}
    width={sweepMaskRadius * 2}
    height={sweepMaskRadius * 2}
  >
    <path d={sweepMask.finalPath} fill="white">
      <animate
        attributeName="d"
        values={sweepMask.pathKeyframes}
        keyTimes={sweepMask.keyTimes}
        dur="{sweepMask.durationSeconds}s"
        begin="{SWEEP_BEGIN_SECONDS}s"
        fill="freeze"
        calcMode="discrete"
      />
    </path>
  </mask>
  <clipPath id="lang-avatar-clip">
    <circle cx={centerX} cy={centerY} r={avatarRadius} />
  </clipPath>
</defs>

<circle
  cx={centerX}
  cy={centerY}
  r={ringMidlineRadius}
  fill="none"
  stroke={theme.text}
  stroke-opacity="0.06"
  stroke-width={ringThickness}
/>

{#if legend.slices.length > 0}
  <g mask="url(#lang-sweep-mask)">
    <g filter="url(#lang-glow)">
      {#each legend.slices as slice (slice.name)}
        <path
          d={generateArcPath({
            centerX,
            centerY,
            outerRadius,
            innerRadius,
            startAngle: slice.startAngleDegrees,
            endAngle: slice.endAngleDegrees,
          })}
          fill={slice.color}
          stroke={theme.base}
          stroke-opacity="0.5"
          stroke-width="1.5"
          class="anim-slice"
          style="transform-origin:{centerX}px {centerY}px; animation-delay:{sweepRevealDelaySeconds(
            slice.startAngleDegrees,
          )}s"
        />
      {/each}
    </g>
  </g>
{/if}

<circle cx={centerX} cy={centerY} r={avatarRadius} fill={theme.surface} />
{#if shouldShowAvatar && avatarDataUri}
  <image
    x={centerX - avatarRadius}
    y={centerY - avatarRadius}
    width={avatarRadius * 2}
    height={avatarRadius * 2}
    href={avatarDataUri}
    clip-path="url(#lang-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{:else if !shouldShowAvatar}
  <text
    x={centerX}
    y={holeCountBaselineY}
    class="text-serif"
    font-size={holeCountFontSize}
    text-anchor="middle"
  >
    {legend.slices.length}
  </text>
  <text
    x={centerX}
    y={holeLabelBaselineY}
    class="text-main"
    font-size={holeLabelFontSize}
    text-anchor="middle"
    style="fill:{theme.subtle}"
  >
    languages
  </text>
{/if}
<circle
  cx={centerX}
  cy={centerY}
  r={avatarRadius}
  fill="none"
  stroke={theme.base}
  stroke-width="3"
/>

{#each legendRows as row, rowIndex (row.name)}
  <g
    class="anim-row"
    style="animation-delay:{LEGEND_ROW_DELAY_SECONDS + rowIndex * LEGEND_ROW_STAGGER_SECONDS}s"
    opacity={row.isFoldedRemainder ? FOLDED_ROW_OPACITY : 1}
  >
    <circle
      cx={legendX + legendDotRadius}
      cy={row.baselineY - legendDotRadius}
      r={legendDotRadius}
      fill={row.color}
    />
    {#each row.nameLines as nameLine, lineIndex (lineIndex)}
      <text
        x={legendX + row.nameInset}
        y={row.baselineY + lineIndex * row.wrapLineHeight}
        class="text-main"
        font-size={row.fontSize}
      >
        {nameLine}
      </text>
    {/each}
    <text
      x={legendX + legendWidth}
      y={row.baselineY}
      class="text-main"
      font-size={row.fontSize}
      text-anchor="end"
      style="fill:{theme.subtle}"
    >
      {row.percentLabel}
    </text>
  </g>
{/each}
