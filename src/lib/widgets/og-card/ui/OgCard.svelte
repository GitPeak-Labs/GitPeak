<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import ReadmeProfileSection from '$lib/widgets/readme-card/ui/ReadmeProfileSection.svelte'
  import ReadmeStatGrid from '$lib/widgets/readme-card/ui/ReadmeStatGrid.svelte'
  import ReadmeLanguagePanel from '$lib/widgets/readme-card/ui/ReadmeLanguagePanel.svelte'
  import ReadmeBackdrop from '$lib/widgets/readme-card/ui/ReadmeBackdrop.svelte'

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

  const WIDTH = 1200
  const HEIGHT = 630
  const PADDING = 44
  const GAP_X = 40
  const GAP_Y = 20
  const PROFILE_HEIGHT = 104
  const SQUARE_CORNER_RADIUS = 0

  const LEFT_X = PADDING
  const LEFT_WIDTH = 600
  const RIGHT_X = LEFT_X + LEFT_WIDTH + GAP_X
  const RIGHT_WIDTH = WIDTH - PADDING - RIGHT_X

  const CONTENT_HEIGHT = HEIGHT - PADDING * 2
  const STAT_GRID_Y = PADDING + PROFILE_HEIGHT + GAP_Y
  const STAT_GRID_HEIGHT = CONTENT_HEIGHT - PROFILE_HEIGHT - GAP_Y
</script>

<svg
  width={WIDTH}
  height={HEIGHT}
  viewBox="0 0 {WIDTH} {HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <ReadmeBackdrop {theme} width={WIDTH} height={HEIGHT} cornerRadius={SQUARE_CORNER_RADIUS} />

  <ReadmeProfileSection
    {statistics}
    {username}
    {theme}
    {avatarDataUri}
    x={LEFT_X}
    y={PADDING}
    width={LEFT_WIDTH}
  />

  <ReadmeStatGrid
    {statistics}
    {theme}
    x={LEFT_X}
    y={STAT_GRID_Y}
    width={LEFT_WIDTH}
    height={STAT_GRID_HEIGHT}
  />

  <ReadmeLanguagePanel
    languages={statistics.languages}
    mostStarredRepo={statistics.mostStarredRepo}
    {theme}
    {avatarDataUri}
    x={RIGHT_X}
    y={PADDING}
    width={RIGHT_WIDTH}
    height={CONTENT_HEIGHT}
  />
</svg>
