<script lang="ts">
  import { fade } from 'svelte/transition'
  import type { CollaboratorOrbitNode } from '../../models/collaborator-orbit-calculations'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import * as Tooltip from '$lib/components/ui/tooltip'

  const MAX_TOOLTIP_REPOS = 3

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
    r={innerRadiusPixels + 10}
    class="stroke-subtle/10 fill-none"
    stroke-dasharray="2 3"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={(innerRadiusPixels + outerRadiusPixels) / 2 + 5}
    class="stroke-subtle/5 fill-none"
    stroke-dasharray="2 3"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={outerRadiusPixels + 12}
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

  <Tooltip.Provider delayDuration={200}>
    {#each orbitNodes as node, index (node.login)}
      {@const isHovered = hoveredIndex === index}
      {@const nodeRepos = [...node.repos].sort((a, b) => b.commits - a.commits)}

      <Tooltip.Root>
        <Tooltip.Trigger
          onmouseenter={() => (hoveredIndex = index)}
          onmouseleave={() => (hoveredIndex = null)}
          onclick={() =>
            window.open(`https://gitpeak.vercel.app/?username=${node.login}`, '_blank')}
        >
          {#snippet child({ props }: { props: Record<string, unknown> })}
            <g
              {...props}
              transition:fade={{ duration: 250, delay: index * 45 }}
              role="button"
              aria-label="View {node.login}"
              class="cursor-pointer outline-none select-none"
              onkeydown={(event: KeyboardEvent) => {
                const isTrigger = event.key === 'Enter' || event.key === ' '
                if (!isTrigger) return
                window.open(`https://gitpeak.vercel.app/?username=${node.login}`, '_blank')
              }}
            >
              <circle
                cx={node.positionX}
                cy={node.positionY}
                r={isHovered ? node.haloSizePixels + 2 : node.haloSizePixels}
                fill={node.accentColor}
                class="transition-all duration-200"
                fill-opacity={isHovered ? 0.3 : 0.1}
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
                stroke-width={isHovered ? 1.5 : 1}
                class="transition-all duration-200"
              />
            </g>
          {/snippet}
        </Tooltip.Trigger>

        <Tooltip.Content
          side="top"
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
</g>
