<script lang="ts">
  import type { GitHubLanguage } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { generateArcPath } from '$lib/shared/lib/pie-geometry'
  import {
    LEGEND_FONT_SIZE,
    LEGEND_NAME_INSET,
    LEGEND_WRAP_LINE_HEIGHT,
    buildReadmeLegend,
    layoutLegendRows,
  } from '../lib/language-legend'
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
  }: {
    languages: GitHubLanguage[]
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    centerY: number
    width: number
  } = $props()

  const OUTER_RADIUS = 104
  const INNER_RADIUS = 66
  const RING_THICKNESS = OUTER_RADIUS - INNER_RADIUS
  const RING_MIDLINE_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2
  const AVATAR_RADIUS_INSET = 5
  const AVATAR_RADIUS = INNER_RADIUS - AVATAR_RADIUS_INSET
  const SWEEP_MASK_RADIUS_PADDING = 12
  const SWEEP_MASK_RADIUS = OUTER_RADIUS + SWEEP_MASK_RADIUS_PADDING
  const LEGEND_GAP = 28
  const LEGEND_MAX_SPAN_PADDING = 36
  const LEGEND_MAX_SPAN = OUTER_RADIUS * 2 + LEGEND_MAX_SPAN_PADDING
  const LEGEND_DOT_RADIUS = 4
  const LEGEND_ROW_DELAY_SECONDS = 0.5
  const LEGEND_ROW_STAGGER_SECONDS = 0.04
  const FOLDED_ROW_OPACITY = 0.6

  const centerX = $derived(x + OUTER_RADIUS)
  const legend = $derived(buildReadmeLegend(languages, theme))
  const legendX = $derived(centerX + OUTER_RADIUS + LEGEND_GAP)
  const legendWidth = $derived(x + width - legendX)
  const legendRows = $derived(
    layoutLegendRows({ rows: legend.rows, legendWidth, centerY, maxSpan: LEGEND_MAX_SPAN }),
  )
  const sweepMask = $derived(buildSweepRevealMask({ centerX, centerY, radius: SWEEP_MASK_RADIUS }))
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
    x={centerX - SWEEP_MASK_RADIUS}
    y={centerY - SWEEP_MASK_RADIUS}
    width={SWEEP_MASK_RADIUS * 2}
    height={SWEEP_MASK_RADIUS * 2}
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
    <circle cx={centerX} cy={centerY} r={AVATAR_RADIUS} />
  </clipPath>
</defs>

<circle
  cx={centerX}
  cy={centerY}
  r={RING_MIDLINE_RADIUS}
  fill="none"
  stroke={theme.text}
  stroke-opacity="0.06"
  stroke-width={RING_THICKNESS}
/>

{#if legend.slices.length > 0}
  <g mask="url(#lang-sweep-mask)">
    <g filter="url(#lang-glow)">
      {#each legend.slices as slice (slice.name)}
        <path
          d={generateArcPath({
            centerX,
            centerY,
            outerRadius: OUTER_RADIUS,
            innerRadius: INNER_RADIUS,
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

<circle cx={centerX} cy={centerY} r={AVATAR_RADIUS} fill={theme.surface} />
{#if avatarDataUri}
  <image
    x={centerX - AVATAR_RADIUS}
    y={centerY - AVATAR_RADIUS}
    width={AVATAR_RADIUS * 2}
    height={AVATAR_RADIUS * 2}
    href={avatarDataUri}
    clip-path="url(#lang-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<circle
  cx={centerX}
  cy={centerY}
  r={AVATAR_RADIUS}
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
      cx={legendX + LEGEND_DOT_RADIUS}
      cy={row.baselineY - LEGEND_DOT_RADIUS}
      r={LEGEND_DOT_RADIUS}
      fill={row.color}
    />
    {#each row.nameLines as nameLine, lineIndex (lineIndex)}
      <text
        x={legendX + LEGEND_NAME_INSET}
        y={row.baselineY + lineIndex * LEGEND_WRAP_LINE_HEIGHT}
        class="text-main"
        font-size={LEGEND_FONT_SIZE}
      >
        {nameLine}
      </text>
    {/each}
    <text
      x={legendX + legendWidth}
      y={row.baselineY}
      class="text-main"
      font-size={LEGEND_FONT_SIZE}
      text-anchor="end"
      style="fill:{theme.subtle}"
    >
      {row.percentLabel}
    </text>
  </g>
{/each}
