<script lang="ts">
  import { langIconUrl as getLanguageIconUrl } from '../lib/language-icons'
  import type { PieSlice } from '$lib/shared/lib/pie-geometry'
  import type { OrbitNode } from '$lib/entities/github-stats/model/orbit-calculations'
  import type {
    CollaboratorOrbitNode,
    CollaboratorSortMode,
  } from '$lib/entities/github-stats/model/collaborator-orbit-calculations'
  import { formatNumber } from '$lib/shared/lib/number-formatting'
  import { ScrollArea } from '$lib/shared/ui/scroll-area'
  import * as Tooltip from '$lib/shared/ui/tooltip'
  import { cn } from '$lib/shared/lib/class-merger'

  const MAX_TOOLTIP_REPOS = 3
  const COLLABORATOR_TOOLTIP_DELAY_MILLISECONDS = 200
  const COLLABORATOR_TOOLTIP_SIDE_OFFSET = 8
  const ROW_TRANSITION_CLASS = 'transition-all duration-200'
  const ROW_BASE_CLASS = 'legend-row flex items-center gap-2 rounded-lg px-2 py-1'
  const BUTTON_ROW_CLASS = 'flex w-full cursor-pointer text-left'
  const TRAILING_TEXT_CLASS = 'shrink-0 text-right font-mono text-[0.625rem] transition-colors'
  const META_TEXT_CLASS = cn('legend-meta', TRAILING_TEXT_CLASS)
  const AVATAR_CLASS = cn(
    'legend-avatar h-6 w-6 shrink-0 overflow-hidden',
    'rounded-full border transition-all',
  )
  const ICON_WRAP_BASE_CLASS =
    'legend-icon flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all'

  let {
    viewMode,
    slices,
    orbitNodes,
    collaboratorNodes = [],
    collaboratorSortMode = 'commits',
    hoveredIndex = $bindable(),
  }: {
    viewMode: 'languages' | 'orbit' | 'collaborators'
    slices: PieSlice[]
    orbitNodes: OrbitNode[]
    collaboratorNodes?: CollaboratorOrbitNode[]
    collaboratorSortMode?: CollaboratorSortMode
    hoveredIndex: number | null
  } = $props()
</script>

<div class="flex w-full flex-col gap-3">
  <ScrollArea class="h-59 w-full pr-3">
    {#if viewMode === 'languages'}
      <div class="fade-in-up flex flex-col gap-0.5">
        {#each slices as slice, index (slice.name)}
          {@const isSliceActive = hoveredIndex === index}
          {@const languageIconUrl = getLanguageIconUrl(slice.name)}

          <div
            role="presentation"
            class={cn(ROW_BASE_CLASS, 'cursor-default select-none', ROW_TRANSITION_CLASS)}
            data-active={isSliceActive || undefined}
            style:--accent={slice.color}
            style:--i={index}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
          >
            <span class={ICON_WRAP_BASE_CLASS}>
              {#if languageIconUrl}
                <span
                  class="legend-glyph h-3.5 w-3.5 opacity-60 transition-opacity"
                  style:--icon-url="url({languageIconUrl})"
                ></span>
              {:else}
                <span class="h-1.5 w-1.5 rounded-full bg-(--accent)"></span>
              {/if}
            </span>

            <span
              class={cn(
                'legend-label line-clamp-2 min-w-0 flex-1',
                'font-mono text-[0.6875rem] break-words transition-colors',
              )}
            >
              {slice.name}
            </span>

            <div class={cn('bg-subtle/10 h-0.75 w-15', 'shrink-0 overflow-hidden rounded-full')}>
              <div
                class="legend-bar bar-grow h-full rounded-full bg-(--accent)"
                style:width="{slice.percentage}%"
              ></div>
            </div>

            <span class={cn(TRAILING_TEXT_CLASS, 'legend-value w-7')}>
              {slice.percentage}%
            </span>
          </div>
        {/each}
      </div>
    {:else if viewMode === 'orbit'}
      <div class="fade-in-up flex flex-col gap-0.5">
        <div class="text-muted px-2 pb-1.5 font-mono text-[0.5625rem] tracking-wider uppercase">
          Recent Activity ({orbitNodes.length})
        </div>

        {#each orbitNodes as node, index (node.url)}
          {@const isNodeActive = hoveredIndex === index}

          <button
            type="button"
            class={cn(ROW_BASE_CLASS, BUTTON_ROW_CLASS, ROW_TRANSITION_CLASS)}
            data-active={isNodeActive || undefined}
            style:--accent={node.languageColor}
            style:--i={index}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
            onclick={() => window.open(node.url, '_blank')}
          >
            <span class={ICON_WRAP_BASE_CLASS}>
              <span class="h-1.5 w-1.5 rounded-full bg-(--accent)"></span>
            </span>

            <div class="flex min-w-0 flex-1 flex-col">
              <span class="legend-label truncate font-mono text-[0.6875rem] transition-colors">
                {node.name}
              </span>
              <span class="text-muted truncate text-[0.5625rem]">
                {node.owner} &nbsp;·&nbsp; {node.primaryLanguage || 'Code'}
              </span>
            </div>

            <span class={META_TEXT_CLASS}>
              {node.relativeTimeLabel}
            </span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="fade-in-up flex flex-col gap-0.5">
        <div class="text-muted px-2 pb-1.5 font-mono text-[0.5625rem] tracking-wider uppercase">
          Collaborators ({collaboratorNodes.length})
        </div>

        <Tooltip.Provider delayDuration={COLLABORATOR_TOOLTIP_DELAY_MILLISECONDS}>
          {#each collaboratorNodes as node, index (node.login)}
            {@const isNodeActive = hoveredIndex === index}

            <Tooltip.Root>
              <Tooltip.Trigger class="contents">
                <button
                  type="button"
                  class={cn(ROW_BASE_CLASS, BUTTON_ROW_CLASS, ROW_TRANSITION_CLASS)}
                  data-active={isNodeActive || undefined}
                  style:--accent={node.accentColor}
                  style:--i={index}
                  onmouseenter={() => (hoveredIndex = index)}
                  onmouseleave={() => (hoveredIndex = null)}
                  onclick={() =>
                    window.open(
                      `/?username=${encodeURIComponent(node.login)}`,
                      '_blank',
                      'noopener,noreferrer',
                    )}
                >
                  <span class={AVATAR_CLASS}>
                    <img
                      src={node.avatarUrl}
                      alt={node.login}
                      class="h-full w-full rounded-full object-cover"
                    />
                  </span>

                  <div class="flex min-w-0 flex-1 flex-col">
                    <span
                      class="legend-label truncate font-mono text-[0.6875rem] transition-colors"
                    >
                      {node.login}
                    </span>
                    <span class="text-muted truncate text-[0.5625rem]">
                      {#if collaboratorSortMode === 'commits'}
                        {node.sharedRepos}
                        {node.sharedRepos === 1 ? 'repo' : 'repos'}
                      {:else}
                        {formatNumber(node.commits)} commits
                      {/if}
                    </span>
                  </div>

                  <span class={META_TEXT_CLASS}>
                    {#if collaboratorSortMode === 'commits'}
                      {formatNumber(node.commits)}
                    {:else}
                      {node.sharedRepos}
                      {node.sharedRepos === 1 ? 'repo' : 'repos'}
                    {/if}
                  </span>
                </button>
              </Tooltip.Trigger>

              <Tooltip.Content
                side="left"
                sideOffset={COLLABORATOR_TOOLTIP_SIDE_OFFSET}
                class="flex max-w-[220px] flex-col items-start gap-1 text-left normal-case"
              >
                <div class="text-muted text-[0.5625rem] tracking-wide uppercase">Shared repos</div>
                {#each node.repos.slice(0, MAX_TOOLTIP_REPOS) as repo (repo.url)}
                  <div class="flex w-full items-start justify-between gap-2">
                    <span class="line-clamp-2 min-w-0 flex-1 break-words">
                      {repo.owner}/{repo.name}
                    </span>
                    <span class="text-muted shrink-0">{formatNumber(repo.commits)}</span>
                  </div>
                {/each}
                {#if node.repos.length > MAX_TOOLTIP_REPOS}
                  <div class="text-muted">+{node.repos.length - MAX_TOOLTIP_REPOS} more</div>
                {/if}
              </Tooltip.Content>
            </Tooltip.Root>
          {/each}
        </Tooltip.Provider>
      </div>
    {/if}
  </ScrollArea>
</div>

<style>
  .legend-row {
    background-color: transparent;
    color: var(--text);
  }

  .legend-row[data-active] {
    background-color: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    translate: 1.5px 0;
  }

  .legend-icon {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .legend-row[data-active] .legend-icon {
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
    scale: 1.05;
  }

  .legend-glyph {
    background-color: currentcolor;
    mask: var(--icon-url) center / contain no-repeat;
  }

  .legend-label {
    font-weight: 400;
  }

  .legend-row[data-active] .legend-label {
    font-weight: 500;
  }

  .legend-value {
    color: var(--muted);
    font-weight: 400;
  }

  .legend-row[data-active] .legend-value {
    color: var(--accent);
    font-weight: 600;
  }

  .legend-meta {
    color: var(--subtle);
  }

  .legend-row[data-active] .legend-meta {
    color: var(--accent);
  }

  .legend-bar {
    opacity: 0.55;
    animation-delay: calc(var(--i) * 20ms);
  }

  .legend-row[data-active] .legend-bar {
    opacity: 1;
  }

  .legend-avatar {
    border-color: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .legend-row[data-active] .legend-avatar {
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    scale: 1.05;
  }
</style>
