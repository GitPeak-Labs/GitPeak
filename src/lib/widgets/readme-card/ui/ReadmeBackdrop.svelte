<script module lang="ts">
  export const CARD_WIDTH = 880
  export const CARD_HEIGHT = 440
</script>

<script lang="ts">
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'

  const ROUNDED_CARD_CORNER_RADIUS = 24

  let {
    theme,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    cornerRadius = ROUNDED_CARD_CORNER_RADIUS,
  }: {
    theme: ThemeTokens
    width?: number
    height?: number
    cornerRadius?: number
  } = $props()

  const BRAND_INSET_X = 24
  const BRAND_INSET_Y = 16
  const AURORA_LAYERS = [
    {
      id: 'aurora-iris',
      token: 'iris',
      centerX: '-10%',
      centerY: '-10%',
      radius: '60%',
      opacity: 0.16,
    },
    {
      id: 'aurora-foam',
      token: 'foam',
      centerX: '110%',
      centerY: '110%',
      radius: '60%',
      opacity: 0.12,
    },
    {
      id: 'aurora-love',
      token: 'love',
      centerX: '65%',
      centerY: '-5%',
      radius: '55%',
      opacity: 0.08,
    },
  ]
</script>

<defs>
  {#each AURORA_LAYERS as layer (layer.id)}
    <radialGradient id={layer.id} cx={layer.centerX} cy={layer.centerY} r={layer.radius}>
      <stop offset="0%" stop-color={theme[layer.token]} stop-opacity={layer.opacity} />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
  {/each}
  <filter id="glass-shadow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
    <feOffset in="blur" dx="0" dy="10" result="offsetBlur" />
    <feFlood flood-color="#000000" flood-opacity="0.4" result="shadowColor" />
    <feComposite in="shadowColor" in2="offsetBlur" operator="in" result="shadow" />
    <feMerge>
      <feMergeNode in="shadow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>

<rect {width} {height} rx={cornerRadius} fill={theme.base} />
{#each AURORA_LAYERS as layer (layer.id)}
  <rect {width} {height} rx={cornerRadius} fill="url(#{layer.id})" />
{/each}

<text
  x={width - BRAND_INSET_X}
  y={height - BRAND_INSET_Y}
  class="text-serif"
  font-size="14"
  font-style="italic"
  style="fill:{theme.iris}"
  fill-opacity="0.55"
  text-anchor="end"
>
  GitPeak
</text>
