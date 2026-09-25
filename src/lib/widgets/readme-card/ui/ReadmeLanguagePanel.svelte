<script lang="ts">
  import type {
    GitHubLanguage,
    MostStarredRepo,
  } from '$lib/entities/github-stats/model/github-stats'
  import { ACCENT_COLORS } from '$lib/shared/lib/accent-cycle'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { buildPieSlices, getDimensions, generateArcPath } from '$lib/shared/lib/pie-geometry'
  import { monoNameBudget, wrapName } from '$lib/shared/lib/legend-fit'
  import ReadmeTopRepo from './ReadmeTopRepo.svelte'

  let {
    languages,
    mostStarredRepo,
    theme,
    avatarDataUri,
    x,
    y,
    width,
    height,
  }: {
    languages: GitHubLanguage[]
    mostStarredRepo: MostStarredRepo | null
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    y: number
    width: number
    height: number
  } = $props()

  const BOTTOM_MARGIN = 20
  const DIVIDER_GAP = 24
  const PANEL_PADDING_X = 24

  const LEGEND_FONT_SIZE = 12
  const LEGEND_ROW_HEIGHT = 28
  const LEGEND_WRAPPED_NAME_LINE_HEIGHT = 16
  const LEGEND_DONUT_GAP = 24
  const LEGEND_TEXT_INSET = 12
  const LEGEND_ROW_BASELINE_OFFSET = 10
  const LEGEND_DOT_OFFSET = 4

  const SERIF_AVERAGE_GLYPH_ADVANCE_EM = 0.5
  const REPO_NAME_FONT_SIZE = 22
  const REPO_NAME_LINE_HEIGHT = 26
  const REPO_NAME_HORIZONTAL_PADDING = 72
  const MAX_LEGEND_ROWS = 8

  const DONUT_X_OFFSET = 24
  const DONUT_Y_OFFSET = 64
  const AVATAR_INNER_INSET = 4

  const HEADER_LABEL_Y_OFFSET = 38
  const USED_BADGE_RIGHT_OFFSET = 84
  const USED_BADGE_Y_OFFSET = 22
  const USED_BADGE_TEXT_RIGHT_OFFSET = 54
  const USED_BADGE_TEXT_Y_OFFSET = 36

  const TOP_REPO_BASE_HEIGHT = 74
  const TOP_REPO_INNER_WIDTH_PADDING = 48

  const ACCENT_TOKENS = ACCENT_COLORS.map((cssVariable) => cssVariable.slice('var(--'.length, -1))

  const dimensions = getDimensions(true)
  const donutX = $derived(x + DONUT_X_OFFSET)
  const donutY = $derived(y + DONUT_Y_OFFSET)
  const centerX = $derived(donutX + dimensions.sizePixels / 2)
  const centerY = $derived(donutY + dimensions.sizePixels / 2)
  const avatarRadius = dimensions.innerRadiusPixels - AVATAR_INNER_INSET

  const slices = $derived(
    buildPieSlices(languages)
      .filter((slice) => slice.percentage > 0)
      .map((slice, index) => ({
        ...slice,
        color: theme[ACCENT_TOKENS[index % ACCENT_TOKENS.length]],
      })),
  )
  const legendSlices = $derived(slices.slice(0, MAX_LEGEND_ROWS))
  const legendX = $derived(donutX + dimensions.sizePixels + LEGEND_DONUT_GAP)
  const legendRowAvailableWidth = $derived(
    x + width - PANEL_PADDING_X - (legendX + LEGEND_TEXT_INSET),
  )
  const legendEntries = $derived.by(() => {
    let offsetY = 0
    return legendSlices.map((slice) => {
      const percentage = Math.round(slice.percentage)
      const lines = wrapName(
        slice.name,
        monoNameBudget(legendRowAvailableWidth, LEGEND_FONT_SIZE, percentage),
      )
      const entry = { ...slice, percentage, lines, offsetY }
      offsetY += LEGEND_ROW_HEIGHT + (lines.length - 1) * LEGEND_WRAPPED_NAME_LINE_HEIGHT
      return entry
    })
  })

  const repoNameLines = $derived(
    mostStarredRepo
      ? wrapName(
          mostStarredRepo.name,
          Math.floor(
            (width - REPO_NAME_HORIZONTAL_PADDING) /
              (REPO_NAME_FONT_SIZE * SERIF_AVERAGE_GLYPH_ADVANCE_EM),
          ),
        )
      : [],
  )
  const topRepoHeight = $derived(
    TOP_REPO_BASE_HEIGHT + repoNameLines.length * REPO_NAME_LINE_HEIGHT,
  )
  const topRepoY = $derived(y + height - BOTTOM_MARGIN - topRepoHeight)
  const dividerY = $derived(topRepoY - DIVIDER_GAP)
</script>

<rect
  {x}
  {y}
  {width}
  {height}
  rx="18"
  fill={theme.surface}
  fill-opacity="0.6"
  stroke={theme.subtle}
  stroke-opacity="0.15"
  filter="url(#glass-shadow)"
/>
<text x={x + PANEL_PADDING_X} y={y + HEADER_LABEL_Y_OFFSET} class="text-subtle">Languages</text>
<rect
  x={x + width - USED_BADGE_RIGHT_OFFSET}
  y={y + USED_BADGE_Y_OFFSET}
  width="60"
  height="20"
  rx="10"
  fill={theme.iris}
  fill-opacity="0.1"
  stroke={theme.iris}
  stroke-opacity="0.2"
/>
<text
  x={x + width - USED_BADGE_TEXT_RIGHT_OFFSET}
  y={y + USED_BADGE_TEXT_Y_OFFSET}
  class="text-main"
  fill={theme.iris}
  font-size="10"
  text-anchor="middle"
>
  {slices.length} used
</text>

<circle
  cx={centerX}
  cy={centerY}
  r={(dimensions.outerRadiusPixels + dimensions.innerRadiusPixels) / 2}
  fill="none"
  stroke={theme.subtle}
  stroke-opacity="0.06"
  stroke-width={dimensions.outerRadiusPixels - dimensions.innerRadiusPixels + 1}
/>

{#if slices.length > 0}
  <g>
    {#each slices as slice (slice.name)}
      {@const pathD = generateArcPath({
        centerX,
        centerY,
        outerRadius: dimensions.outerRadiusPixels,
        innerRadius: dimensions.innerRadiusPixels,
        startAngle: slice.startAngleDegrees,
        endAngle: slice.endAngleDegrees,
      })}
      <path d={pathD} fill={slice.color} />
    {/each}
  </g>
{/if}

<clipPath id="lang-avatar-clip">
  <circle cx={centerX} cy={centerY} r={avatarRadius} />
</clipPath>
{#if avatarDataUri}
  <image
    x={centerX - avatarRadius}
    y={centerY - avatarRadius}
    width={avatarRadius * 2}
    height={avatarRadius * 2}
    href={avatarDataUri}
    clip-path="url(#lang-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<circle
  cx={centerX}
  cy={centerY}
  r={avatarRadius}
  fill="none"
  stroke={theme.surface}
  stroke-width="3"
/>

{#each legendEntries as slice (slice.name)}
  {@const rowY = donutY + slice.offsetY + LEGEND_ROW_BASELINE_OFFSET}

  <g>
    <circle cx={legendX} cy={rowY - LEGEND_DOT_OFFSET} r="4" fill={slice.color} />
    {#each slice.lines as line, lineIndex (lineIndex)}
      <text
        x={legendX + LEGEND_TEXT_INSET}
        y={rowY + lineIndex * LEGEND_WRAPPED_NAME_LINE_HEIGHT}
        class="text-main"
        font-size={LEGEND_FONT_SIZE}
      >
        {line}
      </text>
    {/each}
    <text
      x={x + width - PANEL_PADDING_X}
      y={rowY}
      class="text-main"
      font-size={LEGEND_FONT_SIZE}
      font-weight="600"
      fill={slice.color}
      text-anchor="end"
    >
      {slice.percentage}%
    </text>
  </g>
{/each}

{#if mostStarredRepo}
  <line
    x1={x + PANEL_PADDING_X}
    x2={x + width - PANEL_PADDING_X}
    y1={dividerY}
    y2={dividerY}
    stroke={theme.subtle}
    stroke-opacity="0.15"
  />
  <g>
    <ReadmeTopRepo
      repository={mostStarredRepo}
      nameLines={repoNameLines}
      {theme}
      x={x + PANEL_PADDING_X}
      y={topRepoY}
      width={width - TOP_REPO_INNER_WIDTH_PADDING}
      height={topRepoHeight}
      isNested
    />
  </g>
{/if}
