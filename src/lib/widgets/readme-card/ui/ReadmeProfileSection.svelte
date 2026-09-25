<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { formatNumber } from '$lib/shared/lib/number-formatting'
  import { accountAge } from '$lib/entities/github-stats/model/account-age'
  import { containsCjk } from '$lib/shared/lib/script-segments'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
    x,
    y,
    width,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    y: number
    width: number
  } = $props()

  const HEIGHT = 104
  const AVATAR_SIZE = 72
  const NAME_MAX_CHARACTERS = 22

  const AVATAR_X_OFFSET = 14
  const AVATAR_Y_OFFSET = 16
  const TEXT_X_GAP = 18

  const AGE_BADGE_RIGHT_OFFSET = 96
  const AGE_BADGE_Y_OFFSET = 16
  const AGE_BADGE_TEXT_RIGHT_OFFSET = 55
  const AGE_BADGE_TEXT_Y_OFFSET = 31

  const DISPLAY_NAME_Y_OFFSET = 40
  const USERNAME_Y_OFFSET = 62
  const FOLLOW_STATS_BOTTOM_INSET = 18

  const displayName = $derived(statistics.displayName || username)
  const truncatedName = $derived(
    displayName.length > NAME_MAX_CHARACTERS
      ? `${displayName.slice(0, NAME_MAX_CHARACTERS - 1)}…`
      : displayName,
  )
  const nameFontFamily = $derived(containsCjk(truncatedName) ? "'Noto Serif JP'" : undefined)

  const avatarX = $derived(x + AVATAR_X_OFFSET)
  const avatarY = $derived(y + AVATAR_Y_OFFSET)
  const textX = $derived(avatarX + AVATAR_SIZE + TEXT_X_GAP)
  const age = $derived(accountAge(statistics.accountCreatedAt))
</script>

<rect
  {x}
  {y}
  {width}
  height={HEIGHT}
  rx="18"
  fill={theme.surface}
  fill-opacity="0.6"
  stroke={theme.subtle}
  stroke-opacity="0.15"
  filter="url(#glass-shadow)"
/>

<clipPath id="profile-avatar-clip">
  <rect x={avatarX} y={avatarY} width={AVATAR_SIZE} height={AVATAR_SIZE} rx="16" />
</clipPath>
{#if avatarDataUri}
  <image
    x={avatarX}
    y={avatarY}
    width={AVATAR_SIZE}
    height={AVATAR_SIZE}
    href={avatarDataUri}
    clip-path="url(#profile-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<rect
  x={avatarX}
  y={avatarY}
  width={AVATAR_SIZE}
  height={AVATAR_SIZE}
  rx="16"
  fill="none"
  stroke={theme.iris}
  stroke-opacity="0.3"
/>

<rect
  x={x + width - AGE_BADGE_RIGHT_OFFSET}
  y={y + AGE_BADGE_Y_OFFSET}
  width="82"
  height="22"
  rx="11"
  fill={theme.foam}
  fill-opacity="0.12"
  stroke={theme.foam}
  stroke-opacity="0.25"
/>
<text
  x={x + width - AGE_BADGE_TEXT_RIGHT_OFFSET}
  y={y + AGE_BADGE_TEXT_Y_OFFSET}
  class="text-main"
  fill={theme.foam}
  font-size="10"
  text-anchor="middle"
>
  {age}
</text>

<text
  x={textX}
  y={y + DISPLAY_NAME_Y_OFFSET}
  class="text-serif"
  font-size="26"
  style={nameFontFamily ? `font-family:${nameFontFamily}` : undefined}>{truncatedName}</text
>
<text x={textX} y={y + USERNAME_Y_OFFSET} class="text-main" fill={theme.subtle} font-size="13">
  @{username}
</text>
<text
  x={textX}
  y={y + HEIGHT - FOLLOW_STATS_BOTTOM_INSET}
  class="text-main"
  fill={theme.subtle}
  font-size="11"
>
  <tspan fill={theme.text} font-weight="600">{formatNumber(statistics.followers)}</tspan>
  followers
  <tspan dx="10" fill={theme.text} font-weight="600">{formatNumber(statistics.following)}</tspan>
  following
</text>
