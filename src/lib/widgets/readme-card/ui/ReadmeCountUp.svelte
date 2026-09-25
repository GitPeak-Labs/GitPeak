<script lang="ts">
  import { buildCountUpFrames } from '../lib/count-up-frames'

  let {
    finalCount,
    beginSeconds,
    x,
    y,
    fontSize,
    color,
    textAnchor = 'start',
  }: {
    finalCount: number
    beginSeconds: number
    x: number
    y: number
    fontSize: number
    color?: string
    textAnchor?: 'start' | 'end'
  } = $props()

  const frames = $derived(buildCountUpFrames({ finalCount, beginSeconds }))
  const fillStyle = $derived(color ? `fill:${color}` : undefined)
</script>

{#each frames as frame (frame.label)}
  {#if frame.hideAtSeconds === null}
    <text
      {x}
      {y}
      class="text-serif"
      font-size={fontSize}
      style={fillStyle}
      text-anchor={textAnchor}
    >
      {frame.label}
      {#if frame.showFromSeconds > 0}
        <set attributeName="visibility" to="hidden" begin="0s" end="{frame.showFromSeconds}s" />
      {/if}
    </text>
  {:else}
    <text
      {x}
      {y}
      class="text-serif"
      font-size={fontSize}
      style={fillStyle}
      text-anchor={textAnchor}
      visibility="hidden"
    >
      {frame.label}
      <set
        attributeName="visibility"
        to="visible"
        begin="{frame.showFromSeconds}s"
        end="{frame.hideAtSeconds}s"
      />
    </text>
  {/if}
{/each}
