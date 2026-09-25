<script lang="ts">
  import { generateArcPath, calculateSegmentOffset } from '$lib/shared/lib/pie-geometry'
  import type { PieSlice } from '$lib/shared/lib/pie-geometry'
  import { cn } from '$lib/shared/lib/class-merger'

  let {
    animatedSlices,
    hoveredIndex = $bindable(),
    centerX,
    centerY,
    outerRadiusPixels,
    innerRadiusPixels,
  }: {
    animatedSlices: PieSlice[]
    hoveredIndex: number | null
    centerX: number
    centerY: number
    outerRadiusPixels: number
    innerRadiusPixels: number
  } = $props()
</script>

<g class="transition-opacity duration-300 ease-in-out">
  {#each animatedSlices as slice, index (slice.name)}
    {@const isHovered = hoveredIndex === index}
    {@const isDimmed = hoveredIndex !== null && !isHovered}
    {@const offset = isHovered ? calculateSegmentOffset(slice) : { offsetX: 0, offsetY: 0 }}

    <path
      d={generateArcPath({
        centerX,
        centerY,
        outerRadius: outerRadiusPixels,
        innerRadius: innerRadiusPixels,
        startAngle: slice.startAngleDegrees,
        endAngle: slice.endAngleDegrees,
        offsetX: offset.offsetX,
        offsetY: offset.offsetY,
      })}
      fill={slice.color}
      class={cn(
        'cursor-pointer touch-manipulation transition-all duration-200',
        isDimmed ? 'opacity-20 saturate-50' : 'opacity-100',
      )}
      style={isHovered ? `filter: drop-shadow(0 0 12px ${slice.color}60);` : ''}
      onmouseenter={() => (hoveredIndex = index)}
      onmouseleave={() => (hoveredIndex = null)}
      role="presentation"
    />
  {/each}
</g>
