<script lang="ts">
  import type { Component, Snippet } from 'svelte'
  import type {
    GitHubLanguage,
    InvolvedRepo,
    Collaborator,
  } from '$lib/entities/github-stats/model/github-stats'
  import {
    useLanguagePie,
    buildToggleOptions,
    OWNERSHIP_TOGGLE_SPECS,
    COLLABORATOR_SORT_SPECS,
    ALL_TAB_SPECS,
    type ToggleOption,
    type OwnershipFilter,
    type CollaboratorSortMode,
    type ViewMode,
  } from '../model/useLanguagePie.svelte'
  import { calculateOrbitNodes } from '$lib/entities/github-stats/model/orbit-calculations'
  import {
    calculateCollaboratorOrbitNodes,
    type CollaboratorOrbitLayout,
  } from '$lib/entities/github-stats/model/collaborator-orbit-calculations'
  import LanguagePieChart from './LanguagePieChart.svelte'
  import RecencyOrbitChart from './RecencyOrbitChart.svelte'
  import { CollaboratorOrbitChart } from '$lib/widgets/collaborator-orbit'
  import ChartLegend from './ChartLegend.svelte'

  import { Card, CardContent, CardHeader } from '$lib/shared/ui/card'
  import { Tabs, TabsList, TabsTrigger } from '$lib/shared/ui/tabs'
  import * as Avatar from '$lib/shared/ui/avatar'
  import { fade, scale } from 'svelte/transition'
  import * as Tooltip from '$lib/shared/ui/tooltip'

  import { cn } from '$lib/shared/lib/class-merger'

  const DEFAULT_THEME_COLOR = 'var(--iris)'
  const BUTTON_INSET_PIXELS = 3.5
  const TAB_ICON_SIZE = 10
  const TOGGLE_ICON_SIZE = 11
  const TOGGLE_TOOLTIP_SIDE_OFFSET = 8
  const TOGGLE_BUTTON_BASE_CLASS =
    'flex h-6 w-6 items-center justify-center rounded-full transition-all'
  const TOGGLE_BUTTON_ACTIVE_CLASS = 'bg-iris/20 text-iris'
  const TOGGLE_BUTTON_INACTIVE_CLASS = 'text-muted hover:text-subtle hover:bg-black/5'
  const FLOATING_TOGGLE_WRAPPER_CLASS = cn(
    'bg-base/80 border-subtle/10 absolute -bottom-16 left-1/2 hidden',
    '-translate-x-1/2 items-center gap-0.5 rounded-full border p-1',
    'shadow-lg backdrop-blur-md sm:flex',
  )
  const MOBILE_TOGGLE_WRAPPER_CLASS = cn(
    'bg-base/80 border-subtle/10 flex items-center gap-0.5',
    'rounded-full border p-1 shadow-lg backdrop-blur-md',
  )
  const TAB_TRIGGER_CLASS = 'h-6 px-1.5 font-mono text-[0.5625rem] sm:px-2.5'

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

  let viewMode = $state<ViewMode>('languages')
  let ownershipFilter = $state<OwnershipFilter>('all')
  let collaboratorSortMode = $state<CollaboratorSortMode>('commits')
  let hoveredIndex = $state<number | null>(null)

  const pieManager = useLanguagePie(() => languages)
  const hasCollaborators = $derived(collaborators.length > 0)

  const filteredRepos = $derived.by(() => {
    if (viewMode === 'languages') return involvedRepos
    if (ownershipFilter === 'owned') return involvedRepos.filter((repo) => repo.isOwned)
    if (ownershipFilter === 'others') return involvedRepos.filter((repo) => !repo.isOwned)
    return involvedRepos
  })

  const orbitLayout = $derived<CollaboratorOrbitLayout>({
    centerX: pieManager.dimensions.centerX,
    centerY: pieManager.dimensions.centerY,
    innerRadius: pieManager.dimensions.innerRadiusPixels,
    outerRadius: pieManager.dimensions.outerRadiusPixels,
  })

  const pieDimensionProps = $derived({
    centerX: pieManager.dimensions.centerX,
    centerY: pieManager.dimensions.centerY,
    innerRadiusPixels: pieManager.dimensions.innerRadiusPixels,
    outerRadiusPixels: pieManager.dimensions.outerRadiusPixels,
  })

  const orbitNodes = $derived(calculateOrbitNodes(filteredRepos, languages, orbitLayout))

  const collaboratorOrbitNodes = $derived(
    calculateCollaboratorOrbitNodes(collaborators, orbitLayout, collaboratorSortMode),
  )

  const hoverColorSelectors: Record<typeof viewMode, (index: number) => string | undefined> = {
    orbit: (index) => orbitNodes[index]?.languageColor,
    languages: (index) => pieManager.slices[index]?.color,
    collaborators: (index) => collaboratorOrbitNodes[index]?.accentColor,
  }

  const activeThemeColor = $derived(
    hoveredIndex === null
      ? DEFAULT_THEME_COLOR
      : (hoverColorSelectors[viewMode](hoveredIndex) ?? DEFAULT_THEME_COLOR),
  )

  const buttonSize = $derived((pieManager.dimensions.innerRadiusPixels - BUTTON_INSET_PIXELS) * 2)
  const buttonOffset = $derived((pieManager.dimensions.sizePixels - buttonSize) / 2)
  const buttonStyle = $derived(
    `width: ${buttonSize}px; height: ${buttonSize}px; ` +
      `top: ${buttonOffset}px; left: ${buttonOffset}px;`,
  )

  const baselineRingRadius = $derived(
    (pieManager.dimensions.outerRadiusPixels + pieManager.dimensions.innerRadiusPixels) / 2,
  )
  const baselineRingStrokeWidth = $derived(
    pieManager.dimensions.outerRadiusPixels - pieManager.dimensions.innerRadiusPixels + 1,
  )

  function setOwnershipFilter(nextFilter: OwnershipFilter): void {
    ownershipFilter = nextFilter
  }

  function setCollaboratorSortMode(nextSortMode: CollaboratorSortMode): void {
    collaboratorSortMode = nextSortMode
  }

  const activeToggleOptions = $derived(
    viewMode === 'orbit'
      ? buildToggleOptions(OWNERSHIP_TOGGLE_SPECS, ownershipFilter, setOwnershipFilter)
      : buildToggleOptions(COLLABORATOR_SORT_SPECS, collaboratorSortMode, setCollaboratorSortMode),
  )

  function cycleViewMode(): void {
    if (viewMode === 'languages') viewMode = 'orbit'
    else if (viewMode === 'orbit') viewMode = hasCollaborators ? 'collaborators' : 'languages'
    else viewMode = 'languages'
  }

  function selectViewMode(nextViewMode: string): void {
    viewMode = nextViewMode as typeof viewMode
  }

  const visibleTabSpecs = $derived(
    ALL_TAB_SPECS.filter((tab) => hasCollaborators || tab.tabValue !== 'collaborators'),
  )
</script>

{#snippet toggleGroup(toggleOptions: ToggleOption[])}
  <Tooltip.Provider delayDuration={0}>
    {#each toggleOptions as option (option.tooltipLabel)}
      {@const OptionIcon = option.Icon as Component}
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button
            type="button"
            class={cn(
              TOGGLE_BUTTON_BASE_CLASS,
              option.isActive ? TOGGLE_BUTTON_ACTIVE_CLASS : TOGGLE_BUTTON_INACTIVE_CLASS,
            )}
            onclick={option.onToggle}
          >
            <OptionIcon size={TOGGLE_ICON_SIZE} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" sideOffset={TOGGLE_TOOLTIP_SIDE_OFFSET}>
          {option.tooltipLabel}
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
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

      <Tabs value={viewMode} onValueChange={selectViewMode} class="min-w-0">
        <TabsList class="h-7 min-w-0 rounded-lg bg-black/10 p-0.5">
          {#each visibleTabSpecs as tab (tab.tabValue)}
            {@const TabIcon = tab.Icon as Component}
            <TabsTrigger value={tab.tabValue} class={TAB_TRIGGER_CLASS}>
              <TabIcon size={TAB_ICON_SIZE} class="mr-1" />
              {tab.label}
            </TabsTrigger>
          {/each}
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
          <circle
            cx={pieManager.dimensions.centerX}
            cy={pieManager.dimensions.centerY}
            r={baselineRingRadius}
            fill="none"
            class="stroke-subtle/5"
            stroke-width={baselineRingStrokeWidth}
          />

          {#if viewMode === 'languages'}
            <LanguagePieChart
              animatedSlices={pieManager.animatedSlices}
              bind:hoveredIndex
              {...pieDimensionProps}
            />
          {:else if viewMode === 'orbit'}
            <RecencyOrbitChart {orbitNodes} bind:hoveredIndex {...pieDimensionProps} />
          {:else}
            <CollaboratorOrbitChart
              orbitNodes={collaboratorOrbitNodes}
              bind:hoveredIndex
              {...pieDimensionProps}
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
          style={buttonStyle}
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

        {#if viewMode !== 'languages'}
          <div
            transition:scale={{ duration: 250, start: 0.9 }}
            class={FLOATING_TOGGLE_WRAPPER_CLASS}
          >
            {@render (toggleGroup as Snippet<[ToggleOption[]]>)(activeToggleOptions)}
          </div>
        {/if}
      </div>

      {#if viewMode !== 'languages'}
        <div class="flex sm:hidden" transition:fade={{ duration: 200 }}>
          <div class={MOBILE_TOGGLE_WRAPPER_CLASS}>
            {@render (toggleGroup as Snippet<[ToggleOption[]]>)(activeToggleOptions)}
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
