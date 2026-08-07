<script lang="ts">
  import type { ThemeTokens } from '$lib/theme/theme-manager'

  let {
    username,
    theme,
    message = 'Stats are temporarily unavailable',
  }: {
    username: string
    theme: ThemeTokens
    message?: string
  } = $props()

  const WIDTH = 960
  const HEIGHT = 520
</script>

<svg
  width={WIDTH}
  height={HEIGHT}
  viewBox="0 0 {WIDTH} {HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <radialGradient id="aurora-iris" cx="-10%" cy="-10%" r="60%">
      <stop offset="0%" stop-color={theme.iris} stop-opacity="0.16" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-foam" cx="110%" cy="110%" r="60%">
      <stop offset="0%" stop-color={theme.foam} stop-opacity="0.12" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-love" cx="65%" cy="-5%" r="55%">
      <stop offset="0%" stop-color={theme.love} stop-opacity="0.08" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width={WIDTH} height={HEIGHT} rx="24" fill={theme.base} />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-iris)" />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-foam)" />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-love)" />

  <circle cx={WIDTH / 2} cy={HEIGHT / 2 - 46} r="5" fill={theme.gold} />

  <text
    x={WIDTH / 2}
    y={HEIGHT / 2 + 4}
    class="text-serif"
    font-size="32"
    font-style="italic"
    text-anchor="middle"
  >
    {message}
  </text>

  <text
    x={WIDTH / 2}
    y={HEIGHT / 2 + 40}
    class="text-main"
    font-size="15"
    fill={theme.subtle}
    text-anchor="middle"
  >
    @{username} — this card will refresh automatically
  </text>

  <text
    x={WIDTH - 24}
    y={HEIGHT - 16}
    class="text-serif"
    font-size="14"
    font-style="italic"
    fill={theme.iris}
    fill-opacity="0.55"
    text-anchor="end"
  >
    GitPeak
  </text>
</svg>
