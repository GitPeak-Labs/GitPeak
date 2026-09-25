<script lang="ts">
  import type { GithubStats } from '$lib/entities/github-stats/model/github-stats'
  import { useStatGrid } from '../model/useStatGrid.svelte'
  import { heroItems, detailItems } from '$lib/entities/github-stats/model/stat-items'
  import StatCard from './StatCard.svelte'

  const DETAIL_INDEX_OFFSET = 2

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
    {#each heroItems(statistics) as statItem, index (statItem.label)}
      <StatCard
        {statItem}
        tiltState={gridManager.tilts[index]}
        {index}
        {isTouchDevice}
        variant="hero"
        onEnter={(pointerEvent: MouseEvent) => {
          gridManager.onEnter(pointerEvent, index)
        }}
        onMove={(pointerEvent: MouseEvent) => {
          gridManager.onMove(pointerEvent, index)
        }}
        onLeave={(pointerEvent: MouseEvent) => {
          gridManager.onLeave(pointerEvent, index)
        }}
      />
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
    {#each detailItems(statistics) as statItem, index (statItem.label)}
      {@const detailIndex = index + DETAIL_INDEX_OFFSET}
      <StatCard
        {statItem}
        tiltState={gridManager.tilts[detailIndex]}
        index={detailIndex}
        {isTouchDevice}
        variant="detail"
        onEnter={(pointerEvent: MouseEvent) => {
          gridManager.onEnter(pointerEvent, detailIndex)
        }}
        onMove={(pointerEvent: MouseEvent) => {
          gridManager.onMove(pointerEvent, detailIndex)
        }}
        onLeave={(pointerEvent: MouseEvent) => {
          gridManager.onLeave(pointerEvent, detailIndex)
        }}
      />
    {/each}
  </div>
</div>
