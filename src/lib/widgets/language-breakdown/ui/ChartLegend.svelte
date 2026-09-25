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
  const ROW_ANIMATION_DELAY_STEP_MILLISECONDS = 30
  const BAR_ANIMATION_DELAY_STEP_MILLISECONDS = 20
  const ACTIVE_FONT_WEIGHT = 500
  const INACTIVE_FONT_WEIGHT = 400
  const ACTIVE_PERCENTAGE_FONT_WEIGHT = 600
  const INACTIVE_BAR_OPACITY = 0.55
  const COLLABORATOR_TOOLTIP_DELAY_MILLISECONDS = 200
  const COLLABORATOR_TOOLTIP_SIDE_OFFSET = 8
  const ROW_TRANSITION_CLASS = 'transition-all duration-200'
  const ACTIVE_ROW_TRANSLATE_CLASS = 'translate-x-[1.5px]'
  const ICON_WRAP_TRANSITION_CLASS = 'transition-all'
  const ACTIVE_ICON_SCALE_CLASS = 'scale-105'
  const DEFAULT_TEXT_COLOR = 'var(--text)'
  const INACTIVE_SUBTLE_COLOR = 'var(--subtle)'
  const ICON_WRAP_BASE_CLASS = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-md'

  function buildRowStyle(color: string, isActive: boolean, index: number): string {
    const background = isActive ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent'
    return `
      background-color: ${background};
      color: ${isActive ? color : DEFAULT_TEXT_COLOR};
      animation-delay: ${index * ROW_ANIMATION_DELAY_STEP_MILLISECONDS}ms;
    `
  }

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
            class={cn(
              'flex cursor-default items-center gap-2 rounded-lg px-2 py-1 select-none',
              ROW_TRANSITION_CLASS,
              isSliceActive ? ACTIVE_ROW_TRANSLATE_CLASS : '',
            )}
            style={buildRowStyle(slice.color, isSliceActive, index)}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
          >
            <span
              class={cn(
                ICON_WRAP_BASE_CLASS,
                ICON_WRAP_TRANSITION_CLASS,
                isSliceActive ? ACTIVE_ICON_SCALE_CLASS : '',
              )}
              style={`
                background-color: color-mix(in srgb, ${slice.color} 10%, transparent);
                border: 1px solid color-mix(
                  in srgb, 
                  ${slice.color} ${isSliceActive ? '30%' : '10%'}, 
                  transparent
                );
              `}
            >
              {#if languageIconUrl}
                <span
                  class="h-3.5 w-3.5 opacity-60 transition-opacity"
                  style={`
                    background-color: currentColor;
                    -webkit-mask-image: url(${languageIconUrl});
                    mask-image: url(${languageIconUrl});
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                  `}
                ></span>
              {:else}
                <span class="h-1.5 w-1.5 rounded-full" style="background-color: {slice.color};"
                ></span>
              {/if}
            </span>

            <span
              class={cn(
                'line-clamp-2 min-w-0 flex-1',
                'font-mono text-[0.6875rem] break-words transition-colors',
              )}
              style="font-weight: {isSliceActive ? ACTIVE_FONT_WEIGHT : INACTIVE_FONT_WEIGHT};"
            >
              {slice.name}
            </span>

            <div class={cn('bg-subtle/10 h-0.75 w-15', 'shrink-0 overflow-hidden rounded-full')}>
              <div
                class="bar-grow h-full rounded-full"
                style={`
                  width: ${slice.percentage}%;
                  background-color: ${slice.color};
                  opacity: ${isSliceActive ? 1 : INACTIVE_BAR_OPACITY};
                  animation-delay: ${index * BAR_ANIMATION_DELAY_STEP_MILLISECONDS}ms;
                `}
              ></div>
            </div>

            <span
              class="w-7 shrink-0 text-right font-mono text-[0.625rem] transition-colors"
              style={`
                color: ${isSliceActive ? slice.color : 'var(--muted)'};
                font-weight: ${
                  isSliceActive ? ACTIVE_PERCENTAGE_FONT_WEIGHT : INACTIVE_FONT_WEIGHT
                };
              `}
            >
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
            class={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left',
              ROW_TRANSITION_CLASS,
              isNodeActive ? ACTIVE_ROW_TRANSLATE_CLASS : '',
            )}
            style={buildRowStyle(node.languageColor, isNodeActive, index)}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
            onclick={() => window.open(node.url, '_blank')}
          >
            <span
              class={cn(
                ICON_WRAP_BASE_CLASS,
                ICON_WRAP_TRANSITION_CLASS,
                isNodeActive ? ACTIVE_ICON_SCALE_CLASS : '',
              )}
              style={`
                background-color: color-mix(in srgb, ${node.languageColor} 10%, transparent);
                border: 1px solid color-mix(
                  in srgb,
                  ${node.languageColor} ${isNodeActive ? '30%' : '10%'},
                  transparent
                );
              `}
            >
              <span class="h-1.5 w-1.5 rounded-full" style="background-color: {node.languageColor};"
              ></span>
            </span>

            <div class="flex min-w-0 flex-1 flex-col">
              <span
                class="truncate font-mono text-[0.6875rem] font-medium transition-colors"
                style="font-weight: {isNodeActive ? ACTIVE_FONT_WEIGHT : INACTIVE_FONT_WEIGHT};"
              >
                {node.name}
              </span>
              <span class="text-muted truncate text-[0.5625rem]">
                {node.owner} &nbsp;·&nbsp; {node.primaryLanguage || 'Code'}
              </span>
            </div>

            <span
              class="shrink-0 text-right font-mono text-[0.625rem] transition-colors"
              style={`
                color: ${isNodeActive ? node.languageColor : INACTIVE_SUBTLE_COLOR};
              `}
            >
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
                  class={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg',
                    'px-2 py-1 text-left transition-all duration-200',
                    isNodeActive ? ACTIVE_ROW_TRANSLATE_CLASS : '',
                  )}
                  style={buildRowStyle(node.accentColor, isNodeActive, index)}
                  onmouseenter={() => (hoveredIndex = index)}
                  onmouseleave={() => (hoveredIndex = null)}
                  onclick={() =>
                    window.open(
                      `/?username=${encodeURIComponent(node.login)}`,
                      '_blank',
                      'noopener,noreferrer',
                    )}
                >
                  <span
                    class={cn(
                      'h-6 w-6 shrink-0 overflow-hidden rounded-full border transition-all',
                      isNodeActive ? ACTIVE_ICON_SCALE_CLASS : '',
                    )}
                    style={`
                      border-color: color-mix(
                        in srgb,
                        ${node.accentColor} ${isNodeActive ? '50%' : '20%'},
                        transparent
                      );
                    `}
                  >
                    <img
                      src={node.avatarUrl}
                      alt={node.login}
                      class="h-full w-full rounded-full object-cover"
                    />
                  </span>

                  <div class="flex min-w-0 flex-1 flex-col">
                    <span
                      class="truncate font-mono text-[0.6875rem] font-medium transition-colors"
                      style="font-weight: {isNodeActive
                        ? ACTIVE_FONT_WEIGHT
                        : INACTIVE_FONT_WEIGHT};"
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

                  <span
                    class="shrink-0 text-right font-mono text-[0.625rem] transition-colors"
                    style={`color: ${isNodeActive ? node.accentColor : INACTIVE_SUBTLE_COLOR};`}
                  >
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
