<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { useStatGrid, heroItems, detailItems } from './useStatGrid.svelte'
  import StatCard from './StatCard.svelte'

  let { statistics }: { statistics: GithubStats } = $props()
  const gridManager = useStatGrid()

  let isTouchDevice = $state(false)

  $effect(() => {
    if (typeof window === 'undefined') return

    isTouchDevice = window.matchMedia('(pointer: coarse)').matches
  })
</script>

<div class="flex flex-col gap-3">
  <div class="grid grid-cols-2 gap-3">
    {#each heroItems(statistics) as item, index (item.label)}
      <StatCard
        {item}
        tiltState={gridManager.tilts[index]}
        {index}
        {isTouchDevice}
        variant="hero"
        onEnter={(e) => gridManager.onEnter(e, index)}
        onMove={(e) => gridManager.onMove(e, index)}
        onLeave={(e) => gridManager.onLeave(e, index)}
      />
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
    {#each detailItems(statistics) as item, index (item.label)}
      {@const detailIndex = index + 2}
      <StatCard
        {item}
        tiltState={gridManager.tilts[detailIndex]}
        index={detailIndex}
        {isTouchDevice}
        variant="detail"
        onEnter={(e) => gridManager.onEnter(e, detailIndex)}
        onMove={(e) => gridManager.onMove(e, detailIndex)}
        onLeave={(e) => gridManager.onLeave(e, detailIndex)}
      />
    {/each}
  </div>
</div>
