<script lang="ts">
  import type { Component } from 'svelte'
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { tiltStyle, shineStyle } from '$lib/ui/interactions/mouse-tilt'
  import { useStatGrid, heroItems, detailItems } from './useStatGrid.svelte'
  import * as Card from '$lib/components/ui/card'
  import { cn } from '$lib/ui/styling/class-merger'

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
      {@const Icon = item.icon as Component}
      {@const tiltState = gridManager.tilts[index]}
      {@const themeColor = `var(--${item.accentVar})`}

      <Card.Root
        role="presentation"
        class={cn(
          'tilt-card glass relative cursor-default overflow-hidden',
          'rounded-2xl border-0 bg-transparent shadow-none select-none',
        )}
        style={`
          --accent: ${themeColor};
          --accent-bg: color-mix(in srgb, ${themeColor} 10%, transparent);
          ${tiltStyle(tiltState)}; 
          animation-delay: ${index * 50}ms;
        `}
        onmouseenter={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onEnter(event, index)
          : undefined}
        onmousemove={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onMove(event, index)
          : undefined}
        onmouseleave={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onLeave(event, index)
          : undefined}
      >
        <div
          class={cn(
            'tilt-shine bg-(--accent-bg)',
            'mask-[radial-gradient(ellipse_at_100%_0%,black_0%,transparent_60%)]',
          )}
        ></div>

        {#if !isTouchDevice}
          <div class="tilt-shine" style={shineStyle(tiltState)}></div>
        {/if}

        <Card.Content
          class="relative z-10 flex flex-col gap-3 p-[14px_16px] sm:gap-4 sm:p-[18px_20px]"
        >
          <div class="flex items-center justify-between gap-1.5">
            <span
              class={cn(
                'truncate font-mono text-[0.5625rem] text-(--subtle)',
                'tracking-wider uppercase sm:text-[0.625rem] sm:tracking-widest',
              )}
            >
              {item.label}
            </span>
            <span
              class={cn(
                'flex h-6 w-6 shrink-0 items-center bg-(--accent-bg) text-(--accent)',
                'justify-center rounded-lg sm:h-7 sm:w-7',
              )}
            >
              <Icon size={12} />
            </span>
          </div>

          <span
            class="font-serif leading-none font-bold tracking-tight text-(--text)"
            style="font-size: clamp(1.8rem, 5vw, 2.6rem);"
          >
            {formatNumber(item.value)}
          </span>

          <div
            class="h-0.5 rounded-full bg-(--accent) transition-all duration-200"
            style={`
              width: 48px;
              transform: scaleX(${tiltState.active ? 1 : 0.58});
              transform-origin: left center;
              opacity: ${tiltState.active ? 0.8 : 0.5};
              box-shadow: ${tiltState.active ? '0 0 8px var(--accent)' : 'none'};
            `}
          ></div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
    {#each detailItems(statistics) as item, index (item.label)}
      {@const Icon = item.icon as Component}
      {@const detailIndex = index + 2}
      {@const tiltState = gridManager.tilts[detailIndex]}
      {@const themeColor = `var(--${item.accentVar})`}

      <Card.Root
        role="presentation"
        class={cn(
          'tilt-card glass relative cursor-default overflow-hidden',
          'rounded-[14px] border-0 bg-transparent shadow-none select-none',
          'last:col-span-2 sm:last:col-span-1',
        )}
        style={`
          --accent: ${themeColor};
          --accent-bg: color-mix(in srgb, ${themeColor} 10%, transparent);
          ${tiltStyle(tiltState)}; 
          animation-delay: ${detailIndex * 50}ms;
        `}
        onmouseenter={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onEnter(event, detailIndex)
          : undefined}
        onmousemove={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onMove(event, detailIndex)
          : undefined}
        onmouseleave={!isTouchDevice
          ? (event: MouseEvent) => gridManager.onLeave(event, detailIndex)
          : undefined}
      >
        <div
          class={cn(
            'tilt-shine bg-(--accent-bg)',
            'mask-[radial-gradient(ellipse_at_100%_0%,black_0%,transparent_60%)]',
          )}
        ></div>

        {#if !isTouchDevice}
          <div class="tilt-shine" style={shineStyle(tiltState)}></div>
        {/if}

        <Card.Content
          class="relative z-10 flex flex-col gap-1.5 p-[10px_12px] sm:gap-2 sm:p-[12px_14px]"
        >
          <div class="flex items-center justify-between gap-1.5">
            <span
              class={cn(
                'truncate font-mono text-[0.5625rem] text-(--subtle)',
                'tracking-wider uppercase sm:tracking-widest',
              )}
            >
              {item.label}
            </span>
            <span
              class={cn(
                'flex h-4 w-4 shrink-0 bg-(--accent-bg) text-(--accent)',
                'items-center justify-center rounded-md sm:h-5 sm:w-5',
              )}
            >
              <Icon size={9} />
            </span>
          </div>

          <span
            class="font-serif leading-none font-bold tracking-tight text-(--text)"
            style="font-size: clamp(1.1rem, 4vw, 1.6rem);"
          >
            {formatNumber(item.value)}
          </span>

          <div
            class="h-px rounded-full bg-(--accent) transition-all duration-200 ease-out"
            style={`
              width: 36px;
              transform: scaleX(${tiltState.active ? 1 : 0.55});
              transform-origin: left center;
              opacity: ${tiltState.active ? 0.7 : 0.4};
            `}
          ></div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
