<script lang="ts">
  import type { OrbitNode } from '$lib/entities/github-stats/model/orbit-calculations'

  const INNER_RING_OFFSET_PIXELS = 10
  const MIDDLE_RING_OFFSET_PIXELS = 5
  const OUTER_RING_OFFSET_PIXELS = 12
  const ACTIVE_HALO_FILL_OPACITY = 0.3
  const INACTIVE_HALO_FILL_OPACITY = 0.1

  let {
    orbitNodes,
    hoveredIndex = $bindable(),
    centerX,
    centerY,
    innerRadiusPixels,
    outerRadiusPixels,
  }: {
    orbitNodes: OrbitNode[]
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

  {#each orbitNodes as node, index (node.url)}
    {#if hoveredIndex === index}
      <circle
        cx={centerX}
        cy={centerY}
        r={node.orbitRadius}
        fill="none"
        stroke={node.languageColor}
        class="fade-in opacity-20"
        stroke-width="1"
      />
      <line
        x1={centerX}
        y1={centerY}
        x2={node.positionX}
        y2={node.positionY}
        stroke={node.languageColor}
        class="fade-in opacity-30"
        stroke-width="1"
        stroke-dasharray="2 2"
      />
    {/if}
  {/each}

  {#each orbitNodes as node, index (node.url)}
    {@const isHovered = hoveredIndex === index}
    <g
      role="button"
      tabindex="0"
      aria-label="View {node.name}"
      class="cursor-pointer transition-opacity duration-200 outline-none select-none"
      onmouseenter={() => (hoveredIndex = index)}
      onmouseleave={() => (hoveredIndex = null)}
      onclick={() => window.open(node.url, '_blank')}
      onkeydown={(event) => {
        const isTrigger = event.key === 'Enter' || event.key === ' '
        if (!isTrigger) return
        window.open(node.url, '_blank')
      }}
    >
      <circle
        cx={node.positionX}
        cy={node.positionY}
        r={isHovered ? node.haloSizePixels + 2 : node.haloSizePixels}
        fill={node.languageColor}
        class="transition-all duration-200"
        fill-opacity={isHovered ? ACTIVE_HALO_FILL_OPACITY : INACTIVE_HALO_FILL_OPACITY}
      />
      <circle
        cx={node.positionX}
        cy={node.positionY}
        r={isHovered ? node.coreSizePixels + 1 : node.coreSizePixels}
        fill={node.languageColor}
        class="transition-all duration-200"
      />
    </g>
  {/each}
</g>
