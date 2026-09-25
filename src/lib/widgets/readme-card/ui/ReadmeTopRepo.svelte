<script lang="ts">
  import type { MostStarredRepo } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { formatNumber } from '$lib/shared/lib/number-formatting'

  let {
    repository,
    nameLines = [repository.name],
    theme,
    x,
    y,
    width,
    height = 100,
    isNested = false,
  }: {
    repository: MostStarredRepo
    nameLines?: string[]
    theme: ThemeTokens
    x: number
    y: number
    width: number
    height?: number
    isNested?: boolean
  } = $props()

  const NAME_FIRST_LINE_Y = 60
  const NAME_LINE_HEIGHT = 26
  const HEADER_Y_OFFSET = 26
  const CONTENT_X_INSET = 24
  const starY = $derived(y + NAME_FIRST_LINE_Y + nameLines.length * NAME_LINE_HEIGHT + 2)
</script>

{#if !isNested}
  <rect
    {x}
    {y}
    {width}
    {height}
    rx="14"
    fill={theme.surface}
    fill-opacity="0.6"
    stroke={theme.subtle}
    stroke-opacity="0.15"
    filter="url(#glass-shadow)"
  />
{/if}
<rect {x} {y} width="5" {height} rx="2.5" fill={theme.gold} />
<text x={x + CONTENT_X_INSET} y={y + HEADER_Y_OFFSET} class="text-subtle">★ Top Repository</text>
{#each nameLines as line, lineIndex (lineIndex)}
  <text
    x={x + CONTENT_X_INSET}
    y={y + NAME_FIRST_LINE_Y + lineIndex * NAME_LINE_HEIGHT}
    class="text-serif"
    font-size="22"
  >
    {line}
  </text>
{/each}
<text
  x={x + CONTENT_X_INSET}
  y={starY}
  class="text-main"
  fill={theme.gold}
  font-weight="bold"
  font-size="15"
>
  ★ {formatNumber(repository.stars)}
</text>
