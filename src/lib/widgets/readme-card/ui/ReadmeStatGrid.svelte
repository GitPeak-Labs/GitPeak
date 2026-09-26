<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { layoutStatGrid } from '../lib/stat-grid-layout'
  import ReadmeCountUp from './ReadmeCountUp.svelte'

  let {
    statistics,
    theme,
    x,
    y,
    width,
    height,
    isBoxed = true,
  }: {
    statistics: GithubStats
    theme: ThemeTokens
    x: number
    y: number
    width: number
    height: number
    isBoxed?: boolean
  } = $props()

  const CARD_REVEAL_DELAY_SECONDS = 0.3
  const CARD_STAGGER_SECONDS = 0.07
  const BAR_GROW_LAG_SECONDS = 0.25

  const cards = $derived(layoutStatGrid({ statistics, theme, bounds: { x, y, width, height } }))
</script>

{#each cards as card, cardIndex (card.label)}
  {@const revealSeconds = CARD_REVEAL_DELAY_SECONDS + cardIndex * CARD_STAGGER_SECONDS}
  {@const contentX = isBoxed ? card.x + card.inset : card.x}
  {@const barY = card.y + card.barOffsetY}

  <g class="anim-row" style="animation-delay:{revealSeconds}s">
    {#if isBoxed}
      <rect
        x={card.x}
        y={card.y}
        width={card.width}
        height={card.height}
        rx={card.cornerRadius}
        fill={theme.surface}
        fill-opacity="0.6"
        stroke={theme.subtle}
        stroke-opacity="0.15"
        filter="url(#glass-shadow)"
      />
    {/if}
    <text x={contentX} y={card.y + card.labelBaselineY} class="text-subtle">
      {card.label}
    </text>
    <ReadmeCountUp
      finalCount={card.count}
      beginSeconds={revealSeconds}
      x={contentX}
      y={card.y + card.countBaselineY}
      fontSize={card.countFontSize}
    />
    <rect
      x={contentX}
      y={barY}
      width={card.barWidth}
      height={card.barHeight}
      rx={card.barHeight / 2}
      fill={card.accentColor}
      class="anim-grow"
      style="transform-origin:{contentX}px {barY}px; animation-delay:{revealSeconds +
        BAR_GROW_LAG_SECONDS}s"
    />
  </g>
{/each}
