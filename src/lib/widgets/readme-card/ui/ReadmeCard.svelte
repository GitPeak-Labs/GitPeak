<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import type { ThemeTokens } from '$lib/entities/theme/model/theme-manager'
  import { accountAge } from '$lib/entities/github-stats/model/account-age'
  import { containsCjk } from '$lib/shared/lib/script-segments'
  import { fitDisplayName } from '../lib/display-name'
  import {
    REPO_NAME_FONT_SIZE,
    REPO_STARS_FONT_SIZE,
    STAR_GLYPH_FONT_SIZE,
    layoutTopRepoHeader,
  } from '../lib/top-repo-header'
  import ReadmeBackdrop, { CARD_HEIGHT, CARD_WIDTH } from './ReadmeBackdrop.svelte'
  import ReadmeLanguageHero from './ReadmeLanguageHero.svelte'
  import ReadmeStatGrid from './ReadmeStatGrid.svelte'
  import ReadmeCountUp from './ReadmeCountUp.svelte'

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

  const PADDING = 36
  const BORDER_INSET = 0.5
  const BORDER_CORNER_RADIUS = 23.5
  const NAME_BASELINE_Y = 68
  const NAME_FONT_SIZE = 34
  const NAME_TO_TOP_REPO_GAP = 28
  const TOP_REPO_LABEL_BASELINE_Y = 50
  const TOP_REPO_NAME_BASELINE_Y = 88
  const TOP_REPO_REVEAL_SECONDS = 0.3
  const HANDLE_BASELINE_Y = 92
  const RULE_Y = 110
  const RULE_TO_BODY_GAP = 20
  const BODY_TOP = RULE_Y + RULE_TO_BODY_GAP
  const BODY_BOTTOM = CARD_HEIGHT - PADDING
  const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP
  const BODY_CENTER_Y = (BODY_TOP + BODY_BOTTOM) / 2
  const LANGUAGE_PANEL_WIDTH = 404
  const PANEL_TO_DIVIDER_GAP = 32
  const DIVIDER_X = PADDING + LANGUAGE_PANEL_WIDTH + PANEL_TO_DIVIDER_GAP
  const STAT_GRID_X = DIVIDER_X + PANEL_TO_DIVIDER_GAP
  const STAT_GRID_WIDTH = CARD_WIDTH - PADDING - STAT_GRID_X
  const CONTENT_RIGHT_X = CARD_WIDTH - PADDING

  const topRepo = $derived(
    layoutTopRepoHeader({ repository: statistics.mostStarredRepo, rightEdgeX: CONTENT_RIGHT_X }),
  )
  const nameRightLimitX = $derived(
    topRepo ? topRepo.leftEdgeX - NAME_TO_TOP_REPO_GAP : CONTENT_RIGHT_X,
  )
  const displayName = $derived(
    fitDisplayName(
      statistics.displayName || username,
      (nameRightLimitX - PADDING) / NAME_FONT_SIZE,
    ),
  )
  const displayNameFont = $derived(containsCjk(displayName) ? "'Noto Serif JP'" : undefined)
</script>

<svg
  width={CARD_WIDTH}
  height={CARD_HEIGHT}
  viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <ReadmeBackdrop {theme} />
  <rect
    x={BORDER_INSET}
    y={BORDER_INSET}
    width={CARD_WIDTH - BORDER_INSET * 2}
    height={CARD_HEIGHT - BORDER_INSET * 2}
    rx={BORDER_CORNER_RADIUS}
    stroke={theme.subtle}
    stroke-opacity="0.15"
  />

  <g class="stagger delay-1">
    <text
      x={PADDING}
      y={NAME_BASELINE_Y}
      class="text-serif"
      font-size={NAME_FONT_SIZE}
      style={displayNameFont ? `font-family:${displayNameFont}` : undefined}
    >
      {displayName}
    </text>
    <text
      x={PADDING}
      y={HANDLE_BASELINE_Y}
      class="text-main"
      font-size="12"
      style="fill:{theme.subtle}"
    >
      @{username} · {accountAge(statistics.accountCreatedAt)} on GitHub
    </text>
  </g>

  {#if topRepo}
    <g class="anim-row" style="animation-delay:{TOP_REPO_REVEAL_SECONDS}s">
      <text x={CONTENT_RIGHT_X} y={TOP_REPO_LABEL_BASELINE_Y} class="text-subtle" text-anchor="end">
        Top repository
      </text>
      <text
        x={topRepo.nameEndX}
        y={TOP_REPO_NAME_BASELINE_Y}
        class="text-serif"
        font-size={REPO_NAME_FONT_SIZE}
        text-anchor="end"
      >
        {topRepo.nameLabel}
      </text>
      <text
        x={topRepo.starGlyphEndX}
        y={TOP_REPO_NAME_BASELINE_Y}
        font-size={STAR_GLYPH_FONT_SIZE}
        text-anchor="end"
        fill={theme.gold}
      >
        ★
      </text>
      <ReadmeCountUp
        finalCount={topRepo.starCount}
        beginSeconds={TOP_REPO_REVEAL_SECONDS}
        x={topRepo.countEndX}
        y={TOP_REPO_NAME_BASELINE_Y}
        fontSize={REPO_STARS_FONT_SIZE}
        color={theme.gold}
        textAnchor="end"
      />
    </g>
  {/if}

  <g class="stagger delay-2">
    <line
      x1={PADDING}
      x2={CARD_WIDTH - PADDING}
      y1={RULE_Y}
      y2={RULE_Y}
      stroke={theme.muted}
      stroke-opacity="0.25"
    />
    <line
      x1={DIVIDER_X}
      x2={DIVIDER_X}
      y1={BODY_TOP}
      y2={BODY_BOTTOM}
      stroke={theme.muted}
      stroke-opacity="0.18"
    />
  </g>

  <ReadmeLanguageHero
    languages={statistics.languages}
    {theme}
    {avatarDataUri}
    x={PADDING}
    centerY={BODY_CENTER_Y}
    width={LANGUAGE_PANEL_WIDTH}
  />

  <ReadmeStatGrid
    {statistics}
    {theme}
    x={STAT_GRID_X}
    y={BODY_TOP}
    width={STAT_GRID_WIDTH}
    height={BODY_HEIGHT}
    isBoxed={false}
  />
</svg>
