<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { heroItems, detailItems } from '$lib/github/ui/dashboard/useStatGrid.svelte'
  import { formatNumber } from '$lib/core/formatting/number-formatting'

  let {
    statistics,
    theme,
    x,
    y,
    width,
    height,
  }: {
    statistics: GithubStats
    theme: ThemeTokens
    x: number
    y: number
    width: number
    height: number
  } = $props()

  const HERO_HEIGHT = 112
  const HERO_GAP = 16
  const DETAIL_COLUMNS = 2
  const DETAIL_ROWS = 2
  const DETAIL_COLUMN_GAP = 16
  const DETAIL_ROW_GAP = 12

  const heroWidth = $derived((width - HERO_GAP) / 2)
  const detailWidth = $derived((width - DETAIL_COLUMN_GAP * (DETAIL_COLUMNS - 1)) / DETAIL_COLUMNS)
  const detailTop = $derived(y + HERO_HEIGHT + HERO_GAP)
  const detailAreaHeight = $derived(height - HERO_HEIGHT - HERO_GAP)
  const detailHeight = $derived(
    (detailAreaHeight - DETAIL_ROW_GAP * (DETAIL_ROWS - 1)) / DETAIL_ROWS,
  )

  const hero = $derived(heroItems(statistics))
  const detail = $derived(detailItems(statistics).filter((item) => item.label !== 'Followers'))
</script>

{#each hero as item, index (item.label)}
  {@const cardX = x + index * (heroWidth + HERO_GAP)}
  {@const accent = theme[item.accentVar]}

  <g>
    <rect
      x={cardX}
      {y}
      width={heroWidth}
      height={HERO_HEIGHT}
      rx="16"
      fill={theme.surface}
      fill-opacity="0.6"
      stroke={theme.subtle}
      stroke-opacity="0.15"
      filter="url(#glass-shadow)"
    />
    <text x={cardX + 20} y={y + 34} class="text-subtle">{item.label}</text>
    <text x={cardX + 20} y={y + 80} class="text-serif" font-size="38">
      {formatNumber(item.value)}
    </text>
    <rect x={cardX + 20} y={y + 92} width="48" height="3" rx="1.5" fill={accent} />
  </g>
{/each}

{#each detail as item, index (item.label)}
  {@const column = index % DETAIL_COLUMNS}
  {@const row = Math.floor(index / DETAIL_COLUMNS)}
  {@const cardX = x + column * (detailWidth + DETAIL_COLUMN_GAP)}
  {@const cardY = detailTop + row * (detailHeight + DETAIL_ROW_GAP)}
  {@const accent = theme[item.accentVar]}

  <g>
    <rect
      x={cardX}
      y={cardY}
      width={detailWidth}
      height={detailHeight}
      rx="14"
      fill={theme.surface}
      fill-opacity="0.6"
      stroke={theme.subtle}
      stroke-opacity="0.15"
      filter="url(#glass-shadow)"
    />
    <text x={cardX + 16} y={cardY + 28} class="text-subtle" font-size="10">{item.label}</text>
    <text x={cardX + 16} y={cardY + 66} class="text-serif" font-size="26">
      {formatNumber(item.value)}
    </text>
    <rect x={cardX + 16} y={cardY + 76} width="36" height="2" rx="1" fill={accent} />
  </g>
{/each}
