<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/shared/lib/class-merger'

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = 'default',
    variant = 'default',
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    size?: 'default' | 'sm'
    variant?: 'default' | 'glass'
  } = $props()

  const SHARED_CLASSES = cn(
    'text-card-foreground group/card flex flex-col gap-6 overflow-hidden rounded-4xl py-6 text-sm',
    'has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4',
    '*:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl',
  )
  const VARIANT_CLASSES = {
    default: 'bg-card ring-foreground/5 dark:ring-foreground/10 shadow-md ring-1',
    glass: 'glass',
  } as const
</script>

<div
  bind:this={ref}
  data-slot="card"
  data-size={size}
  class={cn(SHARED_CLASSES, VARIANT_CLASSES[variant], className)}
  {...restProps}
>
  {@render children?.()}
</div>
