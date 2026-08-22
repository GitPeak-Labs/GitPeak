<script lang="ts">
  import type { GitHubLanguage, MostStarredRepo } from '$lib/github/models/github-stats'
  import { ACCENT_COLORS, type ThemeTokens } from '$lib/theme/theme-manager'
  import {
    buildPieSlices,
    getDimensions,
    generateArcPath,
  } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'
  import { monoNameBudget, wrapName } from '$lib/core/text/legend-fit'
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

  const LEGEND_FONT_SIZE = 12
  const LEGEND_ROW_HEIGHT = 28
  // Second line of a wrapped language name — tighter than the row step so the pair reads
  // as one entry.
  const LEGEND_LINE_HEIGHT = 16

  // Instrument Serif is proportional; 0.5em per glyph is a conservative average width, so a
  // repo name line that passes this budget can't reach the panel's right padding.
  const REPO_NAME_FONT_SIZE = 22
  const REPO_NAME_LINE_HEIGHT = 26
  const SERIF_ADVANCE_EM = 0.5
  const MAX_LEGEND_ROWS = 8
  const ACCENT_TOKENS = ACCENT_COLORS.map((cssVariable) => cssVariable.slice('var(--'.length, -1))

  const dimensions = getDimensions(true)
  const donutX = $derived(x + 24)
  const donutY = $derived(y + 64)
  const centerX = $derived(donutX + dimensions.sizePixels / 2)
  const centerY = $derived(donutY + dimensions.sizePixels / 2)
  const avatarRadius = dimensions.innerRadiusPixels - 4

  const slices = $derived(
    buildPieSlices(languages)
      .filter((slice) => slice.percentage > 0)
      .map((slice, index) => ({
        ...slice,
        color: theme[ACCENT_TOKENS[index % ACCENT_TOKENS.length]],
      })),
  )
  const legendSlices = $derived(slices.slice(0, MAX_LEGEND_ROWS))
  const legendX = $derived(donutX + dimensions.sizePixels + 24)
  // From the name's left edge (past the color dot) to the percent label's right anchor.
  const legendRowWidth = $derived(x + width - 24 - (legendX + 12))
  // Long names ("Jupyter Notebook") wrap onto a second line instead of being cut, so each
  // row carries its own vertical offset within the legend.
  const legendEntries = $derived.by(() => {
    let offsetY = 0
    return legendSlices.map((slice) => {
      const percentage = Math.round(slice.percentage)
      const lines = wrapName(
        slice.name,
        monoNameBudget(legendRowWidth, LEGEND_FONT_SIZE, percentage),
      )
      const entry = { ...slice, percentage, lines, offsetY }
      offsetY += LEGEND_ROW_HEIGHT + (lines.length - 1) * LEGEND_LINE_HEIGHT
      return entry
    })
  })

  // A long repo name wraps onto a second line rather than colliding with anything, so the
  // block's height (and the divider above it) follows the wrapped line count.
  const repoNameLines = $derived(
    mostStarredRepo
      ? wrapName(
          mostStarredRepo.name,
          Math.floor((width - 72) / (REPO_NAME_FONT_SIZE * SERIF_ADVANCE_EM)),
        )
      : [],
  )
  const topRepoHeight = $derived(74 + repoNameLines.length * REPO_NAME_LINE_HEIGHT)
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
<text x={x + 24} y={y + 38} class="text-subtle">Languages</text>
<rect
  x={x + width - 84}
  y={y + 22}
  width="60"
  height="20"
  rx="10"
  fill={theme.iris}
  fill-opacity="0.1"
  stroke={theme.iris}
  stroke-opacity="0.2"
/>
<text
  x={x + width - 54}
  y={y + 36}
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
      {@const pathD = generateArcPath(
        centerX,
        centerY,
        dimensions.outerRadiusPixels,
        dimensions.innerRadiusPixels,
        slice.startAngleDegrees,
        slice.endAngleDegrees,
      )}
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
  {@const rowY = donutY + slice.offsetY + 10}

  <g>
    <circle cx={legendX} cy={rowY - 4} r="4" fill={slice.color} />
    {#each slice.lines as line, lineIndex (lineIndex)}
      <text
        x={legendX + 12}
        y={rowY + lineIndex * LEGEND_LINE_HEIGHT}
        class="text-main"
        font-size={LEGEND_FONT_SIZE}
      >
        {line}
      </text>
    {/each}
    <text
      x={x + width - 24}
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
    x1={x + 24}
    x2={x + width - 24}
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
      x={x + 24}
      y={topRepoY}
      width={width - 48}
      height={topRepoHeight}
      nested
    />
  </g>
{/if}
