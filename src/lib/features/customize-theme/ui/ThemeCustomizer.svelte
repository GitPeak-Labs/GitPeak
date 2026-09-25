<script lang="ts">
  import ThemeControls from '$lib/features/customize-theme/ui/ThemeControls.svelte'
  import { Palette, ChevronDown, X } from 'lucide-svelte'
  import { Button } from '$lib/shared/ui/button'
  import { cn } from '$lib/shared/lib/class-merger'

  const TOGGLE_ICON_SIZE = 14
  const CHEVRON_ICON_SIZE = 12
  const CLOSE_ICON_SIZE = 13

  let isOpen = $state(false)
  let panelElement: HTMLDivElement | undefined = $state()
  let toggleElement: HTMLButtonElement | undefined = $state()

  function handleOutsideClick(outsideClickEvent: MouseEvent) {
    if (!isOpen) return
    const target = outsideClickEvent.target as Node
    if (panelElement?.contains(target) || toggleElement?.contains(target)) return
    isOpen = false
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<button
  bind:this={toggleElement}
  type="button"
  onclick={() => (isOpen = !isOpen)}
  class={cn(
    'glass flex items-center gap-2 rounded-xl border px-3',
    'py-2 font-mono text-xs tracking-wide uppercase',
    'transition-all duration-200',
  )}
  style="
    color: var(--subtle);
    border-color: var(--border-glass);
  "
  aria-label="Customize theme"
>
  <Palette size={TOGGLE_ICON_SIZE} />
  <span class="hidden sm:inline">theme</span>
  <ChevronDown
    size={CHEVRON_ICON_SIZE}
    class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
  />
</button>

{#if isOpen}
  <div
    role="button"
    tabindex="-1"
    aria-label="Close theme customizer"
    onclick={() => (isOpen = false)}
    onkeydown={(keydownEvent) => keydownEvent.key === 'Enter' && (isOpen = false)}
    class="fixed inset-0 z-40 bg-black/60 sm:hidden"
  ></div>

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
      box-shadow: 0 32px 64px -16px rgb(0 0 0 / 60%);
    "
  >
    <div
      class="flex items-center justify-between px-4 py-3"
      style="border-bottom: 1px solid color-mix(in srgb,
        var(--highlight-med) 30%, transparent)"
    >
      <span
        class="font-mono text-[0.625rem] tracking-[0.18em] uppercase"
        style="color: var(--subtle)"
      >
        Customize
      </span>
      <Button
        variant="ghost"
        size="icon"
        class="-mr-1.5 h-6 w-6 sm:hidden"
        onclick={() => (isOpen = false)}
        aria-label="Close"
      >
        <X size={CLOSE_ICON_SIZE} />
      </Button>
    </div>

    <div class="flex flex-1 flex-col overflow-y-auto p-4">
      <ThemeControls />
    </div>
  </div>
{/if}
