<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import WallpaperLandscapeContent from './WallpaperLandscapeContent.svelte'
  import WallpaperPortraitContent from './WallpaperPortraitContent.svelte'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
    width,
    height,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
    width: number
    height: number
  } = $props()

  const SCALE_UNITS_ACROSS_WIDTH = 100

  const isLandscape = $derived(width >= height)
  const scaleUnit = $derived(width / SCALE_UNITS_ACROSS_WIDTH)
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="aurora-iris" cx="-10%" cy="-10%" r="65%">
      <stop offset="0%" stop-color={theme.iris} stop-opacity="0.22" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-foam" cx="110%" cy="110%" r="65%">
      <stop offset="0%" stop-color={theme.foam} stop-opacity="0.16" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-love" cx="65%" cy="-5%" r="55%">
      <stop offset="0%" stop-color={theme.love} stop-opacity="0.1" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>

    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={theme.iris} />
      <stop offset="50%" stop-color={theme.foam} />
      <stop offset="100%" stop-color={theme.rose} />
    </linearGradient>

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

  <rect {width} {height} fill={theme.base} />
  <rect {width} {height} fill="url(#aurora-iris)" />
  <rect {width} {height} fill="url(#aurora-foam)" />
  <rect {width} {height} fill="url(#aurora-love)" />

  {#if isLandscape}
    <WallpaperLandscapeContent
      {statistics}
      {username}
      {theme}
      {avatarDataUri}
      {width}
      {height}
      {scaleUnit}
    />
  {:else}
    <WallpaperPortraitContent
      {statistics}
      {username}
      {theme}
      {avatarDataUri}
      {width}
      {height}
      {scaleUnit}
    />
  {/if}
</svg>
