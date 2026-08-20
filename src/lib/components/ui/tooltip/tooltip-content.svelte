<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { cn } from '$lib/ui/styling/class-merger'
  import TooltipPortal from './tooltip-portal.svelte'
  import type { ComponentProps } from 'svelte'
  import type { WithoutChildrenOrChild } from '$lib/ui/styling/class-merger'

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 0,
    side = 'top',
    children,
    arrowClasses,
    portalProps,
    ...restProps
  }: TooltipPrimitive.ContentProps & {
    arrowClasses?: string
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>
  } = $props()
</script>

<TooltipPortal {...portalProps}>
  <TooltipPrimitive.Content
    bind:ref
    data-slot="tooltip-content"
    {sideOffset}
    {side}
    class={cn(
      'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-surface/80 text-text border-subtle/20 z-50 inline-flex w-fit max-w-xs origin-(--bits-tooltip-content-transform-origin) items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-[0.625rem] tracking-wide uppercase shadow-xl backdrop-blur-md has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg',
      className,
    )}
    {...restProps}
  >
    {@render children?.()}
  </TooltipPrimitive.Content>
</TooltipPortal>
