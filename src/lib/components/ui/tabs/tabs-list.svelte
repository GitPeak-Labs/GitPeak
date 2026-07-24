<script lang="ts" module>
  export { tabsListVariants, type TabsListVariant } from './tabs-list-variants.js'
</script>

<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui'
  import { cn } from '$lib/ui/styling/class-merger'
  import { tabsListVariants, type TabsListVariant } from './tabs-list-variants.js'

  let {
    ref = $bindable(null),
    variant = 'default',
    class: className,
    ...restProps
  }: TabsPrimitive.ListProps & {
    variant?: TabsListVariant
  } = $props()
</script>

<TabsPrimitive.List
  bind:ref
  data-slot="tabs-list"
  data-variant={variant}
  class={cn(tabsListVariants({ variant }), className)}
  {...restProps}
/>
