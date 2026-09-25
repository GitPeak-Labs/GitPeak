<script lang="ts">
  import type { CollaboratorOrbitNode } from '$lib/entities/github-stats'
  import { formatNumber } from '$lib/shared/lib/number-formatting'
  import * as Tooltip from '$lib/shared/ui/tooltip'

  const MAX_TOOLTIP_REPOS = 3
  const INNER_RING_OFFSET_PIXELS = 10
  const MIDDLE_RING_OFFSET_PIXELS = 5
  const OUTER_RING_OFFSET_PIXELS = 12
  const TOOLTIP_DELAY_MILLISECONDS = 200
  const TOOLTIP_SIDE_OFFSET = 8
  const ACTIVE_HALO_FILL_OPACITY = 0.3
  const INACTIVE_HALO_FILL_OPACITY = 0.1
  const ACTIVE_CORE_STROKE_WIDTH = 1.5
  const WINDOW_OPEN_TARGET = '_blank'
  const WINDOW_OPEN_FEATURES = 'noopener,noreferrer'

  function openCollaboratorProfile(login: string): void {
    window.open(`/?username=${encodeURIComponent(login)}`, WINDOW_OPEN_TARGET, WINDOW_OPEN_FEATURES)
  }

  let {
    orbitNodes,
    hoveredIndex = $bindable(),
    centerX,
    centerY,
    innerRadiusPixels,
    outerRadiusPixels,
  }: {
    orbitNodes: CollaboratorOrbitNode[]
    hoveredIndex: number | null
    centerX: number
    centerY: number
    innerRadiusPixels: number
    outerRadiusPixels: number
  } = $props()
</script>

<g class="transition-opacity duration-300 ease-in-out">
  <circle
    cx={centerX}
    cy={centerY}
    r={innerRadiusPixels + INNER_RING_OFFSET_PIXELS}
    class="stroke-subtle/10 fill-none"
    stroke-dasharray="2 3"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={(innerRadiusPixels + outerRadiusPixels) / 2 + MIDDLE_RING_OFFSET_PIXELS}
    class="stroke-subtle/5 fill-none"
    stroke-dasharray="2 3"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={outerRadiusPixels + OUTER_RING_OFFSET_PIXELS}
    class="stroke-subtle/5 fill-none"
    stroke-dasharray="2 3"
  />

  <defs>
    {#each orbitNodes as node, index (node.login)}
      <clipPath id="collaborator-clip-{index}">
        <circle cx={node.positionX} cy={node.positionY} r={node.coreSizePixels} />
      </clipPath>
    {/each}
  </defs>

  {#each orbitNodes as node, index (node.login)}
    {#if hoveredIndex === index}
      <circle
        cx={centerX}
        cy={centerY}
        r={node.orbitRadius}
        fill="none"
        stroke={node.accentColor}
        class="fade-in opacity-20"
        stroke-width="1"
      />
      <line
        x1={centerX}
        y1={centerY}
        x2={node.positionX}
        y2={node.positionY}
        stroke={node.accentColor}
        class="fade-in opacity-30"
        stroke-width="1"
        stroke-dasharray="2 2"
      />
    {/if}
  {/each}

  <Tooltip.Provider delayDuration={TOOLTIP_DELAY_MILLISECONDS}>
    {#each orbitNodes as node, index (node.login)}
      {@const isHovered = hoveredIndex === index}

      <Tooltip.Root>
        <Tooltip.Trigger
          onmouseenter={() => (hoveredIndex = index)}
          onmouseleave={() => (hoveredIndex = null)}
          onclick={() => {
            openCollaboratorProfile(node.login)
          }}
        >
          {#snippet child({ props }: { props: Record<string, unknown> })}
            <g
              {...props}
              role="button"
              aria-label="View {node.login}"
              class="cursor-pointer transition-opacity duration-200 outline-none select-none"
              onkeydown={(event: KeyboardEvent) => {
                const isTrigger = event.key === 'Enter' || event.key === ' '
                if (!isTrigger) return
                openCollaboratorProfile(node.login)
              }}
            >
              <circle
                cx={node.positionX}
                cy={node.positionY}
                r={isHovered ? node.haloSizePixels + 2 : node.haloSizePixels}
                fill={node.accentColor}
                class="transition-all duration-200"
                fill-opacity={isHovered ? ACTIVE_HALO_FILL_OPACITY : INACTIVE_HALO_FILL_OPACITY}
              />
              <image
                href={node.avatarUrl}
                x={node.positionX - node.coreSizePixels}
                y={node.positionY - node.coreSizePixels}
                width={node.coreSizePixels * 2}
                height={node.coreSizePixels * 2}
                clip-path="url(#collaborator-clip-{index})"
                class="transition-all duration-200"
              />
              <circle
                cx={node.positionX}
                cy={node.positionY}
                r={isHovered ? node.coreSizePixels + 1 : node.coreSizePixels}
                fill="none"
                stroke={node.accentColor}
                stroke-width={isHovered ? ACTIVE_CORE_STROKE_WIDTH : 1}
                class="transition-all duration-200"
              />
            </g>
          {/snippet}
        </Tooltip.Trigger>

        <Tooltip.Content
          side="top"
          sideOffset={TOOLTIP_SIDE_OFFSET}
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
</g>
