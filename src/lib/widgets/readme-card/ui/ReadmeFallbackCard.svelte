<script lang="ts">
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import ReadmeBackdrop, { CARD_HEIGHT, CARD_WIDTH } from './ReadmeBackdrop.svelte'

  let {
    username,
    theme,
    message = 'Stats are temporarily unavailable',
  }: {
    username: string
    theme: ThemeTokens
    message?: string
  } = $props()

  const CENTER_X = CARD_WIDTH / 2
  const CENTER_Y = CARD_HEIGHT / 2
  const STATUS_DOT_OFFSET_Y = -46
  const STATUS_DOT_RADIUS = 5
  const MESSAGE_OFFSET_Y = 4
  const DETAIL_OFFSET_Y = 40
</script>

<svg
  width={CARD_WIDTH}
  height={CARD_HEIGHT}
  viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <ReadmeBackdrop {theme} />

  <circle
    cx={CENTER_X}
    cy={CENTER_Y + STATUS_DOT_OFFSET_Y}
    r={STATUS_DOT_RADIUS}
    fill={theme.gold}
  />

  <text
    x={CENTER_X}
    y={CENTER_Y + MESSAGE_OFFSET_Y}
    class="text-serif"
    font-size="32"
    font-style="italic"
    text-anchor="middle"
  >
    {message}
  </text>

  <text
    x={CENTER_X}
    y={CENTER_Y + DETAIL_OFFSET_Y}
    class="text-main"
    font-size="15"
    style="fill:{theme.subtle}"
    text-anchor="middle"
  >
    @{username} — this card will refresh automatically
  </text>
</svg>
