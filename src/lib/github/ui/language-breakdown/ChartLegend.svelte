<script lang="ts">
  import { langIconUrl as getLanguageIconUrl } from '$lib/github/ui/language-icons'
  import { fade } from 'svelte/transition'
  import type { PieSlice } from './useLanguagePie.svelte'
  import type { OrbitNode } from '../../models/orbit-calculations'
  import type { CollaboratorOrbitNode } from '../../models/collaborator-orbit-calculations'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { cn } from '$lib/ui/styling/class-merger'

  const MAX_TOOLTIP_REPOS = 3

  let {
    viewMode,
    slices,
    orbitNodes,
    collaboratorNodes = [],
    hoveredIndex = $bindable(),
  }: {
    viewMode: 'languages' | 'orbit' | 'collaborators'
    slices: PieSlice[]
    orbitNodes: OrbitNode[]
    collaboratorNodes?: CollaboratorOrbitNode[]
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
              'transition-all duration-200',
              isSliceActive ? 'translate-x-[1.5px]' : '',
            )}
            style={`
              background-color: ${
                isSliceActive
                  ? `color-mix(in srgb, ${slice.color} 12%, transparent)`
                  : 'transparent'
              };
              color: ${isSliceActive ? slice.color : 'var(--text)'};
              animation-delay: ${index * 30}ms;
            `}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
          >
            <span
              class={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'transition-all',
                isSliceActive ? 'scale-105' : '',
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
                'font-mono text-[11px] break-words transition-colors',
              )}
              style="font-weight: {isSliceActive ? 500 : 400};"
            >
              {slice.name}
            </span>

            <div class={cn('bg-subtle/10 h-0.75 w-15', 'shrink-0 overflow-hidden rounded-full')}>
              <div
                class="bar-grow h-full rounded-full"
                style={`
                  width: ${slice.percentage}%; 
                  background-color: ${slice.color}; 
                  opacity: ${isSliceActive ? 1 : 0.55}; 
                  animation-delay: ${index * 20}ms;
                `}
              ></div>
            </div>

            <span
              class="w-7 shrink-0 text-right font-mono text-[10px] transition-colors"
              style={`
                color: ${isSliceActive ? slice.color : 'var(--muted)'}; 
                font-weight: ${isSliceActive ? 600 : 400};
              `}
            >
              {slice.percentage}%
            </span>
          </div>
        {/each}
      </div>
    {:else if viewMode === 'orbit'}
      <div class="fade-in-up flex flex-col gap-0.5">
        <div class="text-muted px-2 pb-1.5 font-mono text-[9px] tracking-wider uppercase">
          Recent Activity ({orbitNodes.length})
        </div>

        {#each orbitNodes as node, index (node.url)}
          {@const isNodeActive = hoveredIndex === index}

          <button
            transition:fade={{ duration: 150 }}
            type="button"
            class={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left',
              'transition-all duration-200',
              isNodeActive ? 'translate-x-[1.5px]' : '',
            )}
            style={`
              background-color: ${
                isNodeActive
                  ? `color-mix(in srgb, ${node.languageColor} 12%, transparent)`
                  : 'transparent'
              };
              color: ${isNodeActive ? node.languageColor : 'var(--text)'};
              animation-delay: ${index * 30}ms;
            `}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
            onclick={() => window.open(node.url, '_blank')}
          >
            <span
              class={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'transition-all',
                isNodeActive ? 'scale-105' : '',
              )}
              style={`
                background-color: color-mix(
                  in srgb, 
                  ${node.languageColor} 10%, 
                  transparent
                );
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
                class="truncate font-mono text-[11px] font-medium transition-colors"
                style="font-weight: {isNodeActive ? 500 : 400};"
              >
                {node.name}
              </span>
              <span class="text-muted truncate text-[9px]">
                {node.owner} &nbsp;·&nbsp; {node.primaryLanguage || 'Code'}
              </span>
            </div>

            <span
              class="shrink-0 text-right font-mono text-[10px] transition-colors"
              style={`
                color: ${isNodeActive ? node.languageColor : 'var(--subtle)'};
              `}
            >
              {node.relativeTimeLabel}
            </span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="fade-in-up flex flex-col gap-0.5">
        <div class="text-muted px-2 pb-1.5 font-mono text-[9px] tracking-wider uppercase">
          Collaborators ({collaboratorNodes.length})
        </div>

        <Tooltip.Provider delayDuration={200}>
          {#each collaboratorNodes as node, index (node.login)}
            {@const isNodeActive = hoveredIndex === index}
            {@const nodeRepos = [...node.repos].sort((a, b) => b.commits - a.commits)}

            <Tooltip.Root>
              <Tooltip.Trigger class="contents">
                <button
                  transition:fade={{ duration: 150 }}
                  type="button"
                  class={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg',
                    'px-2 py-1 text-left transition-all duration-200',
                    isNodeActive ? 'translate-x-[1.5px]' : '',
                  )}
                  style={`
                    background-color: ${
                      isNodeActive
                        ? `color-mix(in srgb, ${node.accentColor} 12%, transparent)`
                        : 'transparent'
                    };
                    color: ${isNodeActive ? node.accentColor : 'var(--text)'};
                    animation-delay: ${index * 30}ms;
                  `}
                  onmouseenter={() => (hoveredIndex = index)}
                  onmouseleave={() => (hoveredIndex = null)}
                  onclick={() =>
                    window.open(`https://gitpeak.vercel.app/?username=${node.login}`, '_blank')}
                >
                  <span
                    class={cn(
                      'h-6 w-6 shrink-0 overflow-hidden rounded-full border transition-all',
                      isNodeActive ? 'scale-105' : '',
                    )}
                    style={`
                      border-color: color-mix(
                        in srgb,
                        ${node.accentColor} ${isNodeActive ? '50%' : '20%'},
                        transparent
                      );
                    `}
                  >
                    <img src={node.avatarUrl} alt={node.login} class="h-full w-full object-cover" />
                  </span>

                  <div class="flex min-w-0 flex-1 flex-col">
                    <span
                      class="truncate font-mono text-[11px] font-medium transition-colors"
                      style="font-weight: {isNodeActive ? 500 : 400};"
                    >
                      {node.login}
                    </span>
                    <span class="text-muted truncate text-[9px]">
                      {node.sharedRepos}
                      {node.sharedRepos === 1 ? 'repo' : 'repos'}
                    </span>
                  </div>

                  <span
                    class="shrink-0 text-right font-mono text-[10px] transition-colors"
                    style={`color: ${isNodeActive ? node.accentColor : 'var(--subtle)'};`}
                  >
                    {formatNumber(node.commits)}
                  </span>
                </button>
              </Tooltip.Trigger>

              <Tooltip.Content
                side="left"
                sideOffset={8}
                class="flex max-w-[220px] flex-col items-start gap-1 text-left normal-case"
              >
                <div class="text-muted text-[9px] tracking-wide uppercase">Shared repos</div>
                {#each nodeRepos.slice(0, MAX_TOOLTIP_REPOS) as repo (repo.url)}
                  <div class="flex w-full items-start justify-between gap-2">
                    <span class="line-clamp-2 min-w-0 flex-1 break-words">
                      {repo.owner}/{repo.name}
                    </span>
                    <span class="text-muted shrink-0">{formatNumber(repo.commits)}</span>
                  </div>
                {/each}
                {#if nodeRepos.length > MAX_TOOLTIP_REPOS}
                  <div class="text-muted">+{nodeRepos.length - MAX_TOOLTIP_REPOS} more</div>
                {/if}
              </Tooltip.Content>
            </Tooltip.Root>
          {/each}
        </Tooltip.Provider>
      </div>
    {/if}
  </ScrollArea>
</div>
