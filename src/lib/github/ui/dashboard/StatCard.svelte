<script lang="ts">
  import type { Component } from 'svelte'
  import type { StatItem } from './useStatGrid.svelte'
  import type { TiltState } from '$lib/ui/interactions/mouse-tilt'
  import { tiltStyle, shineStyle } from '$lib/ui/interactions/mouse-tilt'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import * as Card from '$lib/components/ui/card'
  import { cn } from '$lib/ui/styling/class-merger'

  type Variant = 'hero' | 'detail'

  const VARIANT_STYLES = {
    hero: {
      cardClass: 'rounded-2xl',
      contentClass: 'relative z-10 flex flex-col gap-3 p-[14px_16px] sm:gap-4 sm:p-[18px_20px]',
      labelClass: cn(
        'truncate font-mono text-[0.5625rem] text-(--subtle)',
        'tracking-wider uppercase sm:text-[0.625rem] sm:tracking-widest',
      ),
      iconWrapClass: cn(
        'flex h-6 w-6 shrink-0 items-center bg-(--accent-bg) text-(--accent)',
        'justify-center rounded-lg sm:h-7 sm:w-7',
      ),
      iconSize: 12,
      valueStyle: 'font-size: clamp(1.8rem, 5vw, 2.6rem);',
      underlineClass: 'h-0.5 rounded-full bg-(--accent) transition-all duration-200',
      underlineWidth: 48,
      activeOpacity: 0.8,
      inactiveOpacity: 0.5,
      inactiveScale: 0.58,
      glow: true,
    },
    detail: {
      cardClass: 'rounded-[14px] last:col-span-2 sm:last:col-span-1',
      contentClass: 'relative z-10 flex flex-col gap-1.5 p-[10px_12px] sm:gap-2 sm:p-[12px_14px]',
      labelClass: cn(
        'truncate font-mono text-[0.5625rem] text-(--subtle)',
        'tracking-wider uppercase sm:tracking-widest',
      ),
      iconWrapClass: cn(
        'flex h-4 w-4 shrink-0 bg-(--accent-bg) text-(--accent)',
        'items-center justify-center rounded-md sm:h-5 sm:w-5',
      ),
      iconSize: 9,
      valueStyle: 'font-size: clamp(1.1rem, 4vw, 1.6rem);',
      underlineClass: 'h-px rounded-full bg-(--accent) transition-all duration-200 ease-out',
      underlineWidth: 36,
      activeOpacity: 0.7,
      inactiveOpacity: 0.4,
      inactiveScale: 0.55,
      glow: false,
    },
  } as const

  let {
    item,
    tiltState,
    index,
    isTouchDevice,
    variant,
    onEnter,
    onMove,
    onLeave,
  }: {
    item: StatItem
    tiltState: TiltState
    index: number
    isTouchDevice: boolean
    variant: Variant
    onEnter: (e: MouseEvent) => void
    onMove: (e: MouseEvent) => void
    onLeave: (e: MouseEvent) => void
  } = $props()

  const Icon = $derived(item.icon as Component)
  const themeColor = $derived(`var(--${item.accentVar})`)
  const style = $derived(VARIANT_STYLES[variant])
</script>

<Card.Root
  role="presentation"
  class={cn(
    'tilt-card glass relative cursor-default overflow-hidden',
    'border-0 bg-transparent shadow-none select-none',
    style.cardClass,
  )}
  style={`
    --accent: ${themeColor};
    --accent-bg: color-mix(in srgb, ${themeColor} 10%, transparent);
    ${tiltStyle(tiltState)};
    animation-delay: ${index * 50}ms;
  `}
  onmouseenter={!isTouchDevice ? onEnter : undefined}
  onmousemove={!isTouchDevice ? onMove : undefined}
  onmouseleave={!isTouchDevice ? onLeave : undefined}
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

  <Card.Content class={style.contentClass}>
    <div class="flex items-center justify-between gap-1.5">
      <span class={style.labelClass}>
        {item.label}
      </span>
      <span class={style.iconWrapClass}>
        <Icon size={style.iconSize} />
      </span>
    </div>

    <span
      class="font-serif leading-none font-bold tracking-tight text-(--text)"
      style={style.valueStyle}
    >
      {formatNumber(item.value)}
    </span>

    <div
      class={style.underlineClass}
      style={`
        width: ${style.underlineWidth}px;
        transform: scaleX(${tiltState.active ? 1 : style.inactiveScale});
        transform-origin: left center;
        opacity: ${tiltState.active ? style.activeOpacity : style.inactiveOpacity};
        box-shadow: ${style.glow && tiltState.active ? '0 0 8px var(--accent)' : 'none'};
      `}
    ></div>
  </Card.Content>
</Card.Root>
