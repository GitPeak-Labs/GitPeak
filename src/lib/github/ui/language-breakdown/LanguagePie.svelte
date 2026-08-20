<script lang="ts">
  import type { GitHubLanguage, InvolvedRepo, Collaborator } from '$lib/github/models/github-stats'
  import { useLanguagePie } from './useLanguagePie.svelte'
  import { calculateOrbitNodes } from '../../models/orbit-calculations'
  import {
    calculateCollaboratorOrbitNodes,
    type CollaboratorSortMode,
  } from '../../models/collaborator-orbit-calculations'
  import LanguagePieChart from './LanguagePieChart.svelte'
  import RecencyOrbitChart from './RecencyOrbitChart.svelte'
  import CollaboratorOrbitChart from '$lib/github/ui/collaborators/CollaboratorOrbitChart.svelte'
  import ChartLegend from './ChartLegend.svelte'

  import { Card, CardContent, CardHeader } from '$lib/components/ui/card'
  import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Orbit, Palette, Globe, User, Users, Handshake, GitCommit, Repeat2 } from 'lucide-svelte'
  import { fade, scale } from 'svelte/transition'
  import * as Tooltip from '$lib/components/ui/tooltip'

  import { cn } from '$lib/ui/styling/class-merger'

  let {
    languages,
    avatarUrl,
    involvedRepos = [],
    collaborators = [],
  }: {
    languages: GitHubLanguage[]
    avatarUrl: string
    involvedRepos?: InvolvedRepo[]
    collaborators?: Collaborator[]
  } = $props()

  let viewMode = $state<'languages' | 'orbit' | 'collaborators'>('languages')
  let ownershipFilter = $state<'all' | 'owned' | 'others'>('all')
  let collaboratorSortMode = $state<CollaboratorSortMode>('commits')
  let hoveredIndex = $state<number | null>(null)

  const pieManager = useLanguagePie(() => languages)
  const hasCollaborators = $derived(collaborators.length > 0)

  const filteredRepos = $derived.by(() => {
    if (viewMode === 'languages') return involvedRepos
    if (ownershipFilter === 'owned') return involvedRepos.filter((r) => r.isOwned)
    if (ownershipFilter === 'others') return involvedRepos.filter((r) => !r.isOwned)
    return involvedRepos
  })

  const orbitNodes = $derived(
    calculateOrbitNodes(
      filteredRepos,
      languages,
      pieManager.dimensions.centerX,
      pieManager.dimensions.centerY,
      pieManager.dimensions.innerRadiusPixels,
      pieManager.dimensions.outerRadiusPixels,
    ),
  )

  const collaboratorOrbitNodes = $derived(
    calculateCollaboratorOrbitNodes(
      collaborators,
      pieManager.dimensions.centerX,
      pieManager.dimensions.centerY,
      pieManager.dimensions.innerRadiusPixels,
      pieManager.dimensions.outerRadiusPixels,
      collaboratorSortMode,
    ),
  )

  const activeThemeColor = $derived.by(() => {
    if (viewMode === 'orbit' && hoveredIndex !== null)
      return orbitNodes[hoveredIndex]?.languageColor || 'var(--iris)'

    if (viewMode === 'languages' && hoveredIndex !== null)
      return pieManager.slices[hoveredIndex]?.color || 'var(--iris)'

    if (viewMode === 'collaborators' && hoveredIndex !== null)
      return collaboratorOrbitNodes[hoveredIndex]?.accentColor || 'var(--iris)'

    return 'var(--iris)'
  })

  const buttonSize = $derived((pieManager.dimensions.innerRadiusPixels - 3.5) * 2)
  const buttonOffset = $derived((pieManager.dimensions.sizePixels - buttonSize) / 2)

  function cycleViewMode() {
    if (viewMode === 'languages') viewMode = 'orbit'
    else if (viewMode === 'orbit') viewMode = hasCollaborators ? 'collaborators' : 'languages'
    else viewMode = 'languages'
  }
</script>

{#snippet ownershipToggle()}
  <Tooltip.Provider delayDuration={0}>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            ownershipFilter === 'all'
              ? 'bg-iris/20 text-iris'
              : 'text-muted hover:text-subtle hover:bg-black/5',
          )}
          onclick={() => (ownershipFilter = 'all')}
        >
          <Globe size={11} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" sideOffset={8}>All Repos</Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            ownershipFilter === 'owned'
              ? 'bg-iris/20 text-iris'
              : 'text-muted hover:text-subtle hover:bg-black/5',
          )}
          onclick={() => (ownershipFilter = 'owned')}
        >
          <User size={11} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" sideOffset={8}>My Repos</Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            ownershipFilter === 'others'
              ? 'bg-iris/20 text-iris'
              : 'text-muted hover:text-subtle hover:bg-black/5',
          )}
          onclick={() => (ownershipFilter = 'others')}
        >
          <Users size={11} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" sideOffset={8}>Contributions</Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/snippet}

{#snippet collaboratorSortToggle()}
  <Tooltip.Provider delayDuration={0}>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            collaboratorSortMode === 'commits'
              ? 'bg-iris/20 text-iris'
              : 'text-muted hover:text-subtle hover:bg-black/5',
          )}
          onclick={() => (collaboratorSortMode = 'commits')}
        >
          <GitCommit size={11} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" sideOffset={8}>Sort by Commits</Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>
        <button
          class={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            collaboratorSortMode === 'frequency'
              ? 'bg-iris/20 text-iris'
              : 'text-muted hover:text-subtle hover:bg-black/5',
          )}
          onclick={() => (collaboratorSortMode = 'frequency')}
        >
          <Repeat2 size={11} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" sideOffset={8}>Sort by Collab Frequency</Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/snippet}

<Card class="glass overflow-hidden rounded-2xl">
  <CardHeader class="p-4 pb-0 sm:p-5">
    <div class="flex items-center justify-between gap-2">
      <span
        class="text-subtle hidden font-mono text-[0.625rem] tracking-widest uppercase sm:inline"
      >
        {viewMode === 'languages'
          ? 'Languages'
          : viewMode === 'orbit'
            ? 'Recency Orbit'
            : 'Collaborators'}
      </span>

      <Tabs
        value={viewMode}
        onValueChange={(value) => (viewMode = value as typeof viewMode)}
        class="min-w-0"
      >
        <TabsList class="h-7 min-w-0 rounded-lg bg-black/10 p-0.5">
          <TabsTrigger value="languages" class="h-6 px-1.5 font-mono text-[0.5625rem] sm:px-2.5">
            <Palette size={10} class="mr-1" />
            Lang
          </TabsTrigger>
          <TabsTrigger value="orbit" class="h-6 px-1.5 font-mono text-[0.5625rem] sm:px-2.5">
            <Orbit size={10} class="mr-1" />
            Orbit
          </TabsTrigger>
          {#if hasCollaborators}
            <TabsTrigger
              value="collaborators"
              class="h-6 px-1.5 font-mono text-[0.5625rem] sm:px-2.5"
            >
              <Handshake size={10} class="mr-1" />
              Collab
            </TabsTrigger>
          {/if}
        </TabsList>
      </Tabs>
    </div>
  </CardHeader>

  <CardContent class="min-h-[300px] p-4 pt-4 pb-8 sm:p-5 sm:pb-16">
    <div
      class="flex flex-col items-center justify-center gap-5
        sm:flex-row sm:items-start"
    >
      <div
        class="relative shrink-0"
        style="width: {pieManager.dimensions.sizePixels}px;
               height: {pieManager.dimensions.sizePixels}px;"
      >
        <svg
          width={pieManager.dimensions.sizePixels}
          height={pieManager.dimensions.sizePixels}
          class="pointer-events-auto absolute inset-0 overflow-visible"
        >
          <!-- Baseline Ring -->
          <circle
            cx={pieManager.dimensions.centerX}
            cy={pieManager.dimensions.centerY}
            r={(pieManager.dimensions.outerRadiusPixels + pieManager.dimensions.innerRadiusPixels) /
              2}
            fill="none"
            class="stroke-subtle/5"
            stroke-width={pieManager.dimensions.outerRadiusPixels -
              pieManager.dimensions.innerRadiusPixels +
              1}
          />

          {#if viewMode === 'languages'}
            <LanguagePieChart
              animatedSlices={pieManager.animatedSlices}
              bind:hoveredIndex
              centerX={pieManager.dimensions.centerX}
              centerY={pieManager.dimensions.centerY}
              innerRadiusPixels={pieManager.dimensions.innerRadiusPixels}
              outerRadiusPixels={pieManager.dimensions.outerRadiusPixels}
            />
          {:else if viewMode === 'orbit'}
            <RecencyOrbitChart
              {orbitNodes}
              bind:hoveredIndex
              centerX={pieManager.dimensions.centerX}
              centerY={pieManager.dimensions.centerY}
              innerRadiusPixels={pieManager.dimensions.innerRadiusPixels}
              outerRadiusPixels={pieManager.dimensions.outerRadiusPixels}
            />
          {:else}
            <CollaboratorOrbitChart
              orbitNodes={collaboratorOrbitNodes}
              bind:hoveredIndex
              centerX={pieManager.dimensions.centerX}
              centerY={pieManager.dimensions.centerY}
              innerRadiusPixels={pieManager.dimensions.innerRadiusPixels}
              outerRadiusPixels={pieManager.dimensions.outerRadiusPixels}
            />
          {/if}

          <circle
            cx={pieManager.dimensions.centerX}
            cy={pieManager.dimensions.centerY}
            r={pieManager.dimensions.innerRadiusPixels - 2}
            fill="none"
            stroke-width="1.5"
            class="transition-colors duration-200"
            style="stroke: color-mix(in srgb, {activeThemeColor} {hoveredIndex !== null
              ? '40%'
              : '18%'}, transparent);"
          />
        </svg>

        <button
          type="button"
          onclick={cycleViewMode}
          class={cn(
            'bg-base group absolute flex cursor-pointer items-center',
            'justify-center overflow-hidden rounded-full border-none',
            'shadow-md transition-transform outline-none active:scale-95',
          )}
          style={`
            width: ${buttonSize}px; 
            height: ${buttonSize}px; 
            top: ${buttonOffset}px; 
            left: ${buttonOffset}px;
          `}
        >
          <Avatar.Root
            class="absolute inset-0 h-full w-full transition-all
              group-hover:brightness-110"
          >
            <Avatar.Image src={avatarUrl} alt="User avatar" />
            <Avatar.Fallback class="bg-muted text-muted-foreground font-mono text-xs">
              GP
            </Avatar.Fallback>
          </Avatar.Root>
        </button>

        {#if viewMode === 'orbit'}
          <div
            transition:scale={{ duration: 250, start: 0.9 }}
            class={cn(
              'bg-base/80 border-subtle/10 absolute -bottom-16 left-1/2 hidden',
              '-translate-x-1/2 items-center gap-0.5 rounded-full border p-1',
              'shadow-lg backdrop-blur-md sm:flex',
            )}
          >
            {@render ownershipToggle()}
          </div>
        {:else if viewMode === 'collaborators'}
          <div
            transition:scale={{ duration: 250, start: 0.9 }}
            class={cn(
              'bg-base/80 border-subtle/10 absolute -bottom-16 left-1/2 hidden',
              '-translate-x-1/2 items-center gap-0.5 rounded-full border p-1',
              'shadow-lg backdrop-blur-md sm:flex',
            )}
          >
            {@render collaboratorSortToggle()}
          </div>
        {/if}
      </div>

      {#if viewMode === 'orbit'}
        <div class="flex sm:hidden" transition:fade={{ duration: 200 }}>
          <div
            class={cn(
              'bg-base/80 border-subtle/10 flex items-center gap-0.5',
              'rounded-full border p-1 shadow-lg backdrop-blur-md',
            )}
          >
            {@render ownershipToggle()}
          </div>
        </div>
      {:else if viewMode === 'collaborators'}
        <div class="flex sm:hidden" transition:fade={{ duration: 200 }}>
          <div
            class={cn(
              'bg-base/80 border-subtle/10 flex items-center gap-0.5',
              'rounded-full border p-1 shadow-lg backdrop-blur-md',
            )}
          >
            {@render collaboratorSortToggle()}
          </div>
        </div>
      {/if}

      <div class="w-full sm:w-64">
        <ChartLegend
          {viewMode}
          slices={pieManager.slices}
          {orbitNodes}
          collaboratorNodes={collaboratorOrbitNodes}
          {collaboratorSortMode}
          bind:hoveredIndex
        />
      </div>
    </div>
  </CardContent>
</Card>
