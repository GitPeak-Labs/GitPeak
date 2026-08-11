<script lang="ts">
  import ThemeControls from '$lib/theme/ThemeControls.svelte'
  import { Palette, ChevronDown } from 'lucide-svelte'
  import { cn } from '$lib/ui/styling/class-merger'

  let open = $state(false)
  let panelElement: HTMLDivElement | undefined = $state()
  let toggleElement: HTMLButtonElement | undefined = $state()

  function handleOutsideClick(e: MouseEvent) {
    if (!open) return
    const target = e.target as Node
    if (panelElement?.contains(target) || toggleElement?.contains(target)) return
    open = false
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<!-- Toggle button -->
<button
  bind:this={toggleElement}
  onclick={() => (open = !open)}
  class={cn(
    'glass flex items-center gap-2 rounded-xl border px-3',
    'py-2 font-mono text-xs tracking-wide uppercase',
    'transition-all duration-200',
  )}
  style="
    color: var(--subtle);
    border-color: color-mix(in srgb, var(--highlight-med) 50%, transparent);
  "
  aria-label="Customize theme"
>
  <Palette size={14} />
  <span class="hidden sm:inline">theme</span>
  <ChevronDown size={12} class="transition-transform duration-200 {open ? 'rotate-180' : ''}" />
</button>

{#if open}
  <div
    bind:this={panelElement}
    class={cn(
      'fixed top-16 right-2 left-2 z-50 flex max-h-[80vh]',
      'flex-col overflow-hidden rounded-2xl sm:right-4',
      'sm:left-auto sm:w-[320px]',
    )}
    style="
      background: var(--overlay);
      border: 1px solid color-mix(in srgb, var(--subtle) 20%, transparent);
      box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
    "
  >
    <div
      class="flex items-center justify-between px-4 py-3"
      style="border-bottom: 1px solid color-mix(in srgb,
        var(--highlight-med) 30%, transparent)"
    >
      <span class="font-mono text-[10px] tracking-[0.18em] uppercase" style="color: var(--subtle)">
        Customize
      </span>
    </div>

    <div class="flex flex-1 flex-col overflow-y-auto p-4">
      <ThemeControls />
    </div>
  </div>
{/if}
