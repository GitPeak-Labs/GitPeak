<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import ReadmeProfileSection from './ReadmeProfileSection.svelte'
  import ReadmeStatGrid from './ReadmeStatGrid.svelte'
  import ReadmeLanguagePanel from './ReadmeLanguagePanel.svelte'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
  } = $props()

  const WIDTH = 960
  const HEIGHT = 520
  const LEFT_X = 40
  const LEFT_WIDTH = 464
  const RIGHT_X = 536
  const RIGHT_WIDTH = 384
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

  <rect width={WIDTH} height={HEIGHT} rx="24" fill={theme.base} />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-iris)" />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-foam)" />
  <rect width={WIDTH} height={HEIGHT} rx="24" fill="url(#aurora-love)" />

  <ReadmeProfileSection
    {statistics}
    {username}
    {theme}
    {avatarDataUri}
    x={LEFT_X}
    y={40}
    width={LEFT_WIDTH}
  />

  <ReadmeStatGrid {statistics} {theme} x={LEFT_X} y={160} width={LEFT_WIDTH} height={326} />

  <ReadmeLanguagePanel
    languages={statistics.languages}
    mostStarredRepo={statistics.mostStarredRepo}
    {theme}
    {avatarDataUri}
    x={RIGHT_X}
    y={40}
    width={RIGHT_WIDTH}
    height={446}
  />

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
