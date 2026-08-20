<script lang="ts">
  import { scale } from 'svelte/transition'
  import { PRESET_THEMES, applyPreset, previewPreset } from '$lib/theme/theme-manager'
  import { getActivePresetName, setActivePresetName } from '$lib/theme/theme-state.svelte'
  import { Palette } from 'lucide-svelte'
  import { cn } from '$lib/ui/styling/class-merger'

  const presetNames = Object.keys(PRESET_THEMES)
  const SEGMENT_DEGREES = 360 / presetNames.length
  const RING_RADIUS_PIXELS = 104
  const FAB_SIZE_PIXELS = 52
  const TAP_THRESHOLD_DEGREES = 8

  let fabElement: HTMLButtonElement | undefined = $state()
  let open = $state(false)
  let isDragging = $state(false)
  let centerX = $state(0)
  let centerY = $state(0)
  let rotationDegrees = $state(0)

  let dragStartPointerAngle = 0
  let dragStartRotation = 0

  const currentPresetName = $derived(getActivePresetName() ?? 'Rosé Pine')

  const activeIndex = $derived.by(() => {
    const normalizedDegrees = ((-rotationDegrees % 360) + 360) % 360
    return Math.round(normalizedDegrees / SEGMENT_DEGREES) % presetNames.length
  })

  $effect(() => {
    if (!open) return
    const theme = presetNames[activeIndex]
    previewPreset(theme)
    setActivePresetName(theme)
  })

  function angleFromCenter(clientX: number, clientY: number): number {
    return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI
  }

  function alignRotationToCurrentPreset(): number {
    const activePresetIndex = Math.max(0, presetNames.indexOf(currentPresetName))
    return -activePresetIndex * SEGMENT_DEGREES
  }

  function handlePointerDown(e: PointerEvent): void {
    if (!fabElement) return

    const rect = fabElement.getBoundingClientRect()
    centerX = rect.left + rect.width / 2
    centerY = rect.top + rect.height / 2

    rotationDegrees = alignRotationToCurrentPreset()

    dragStartPointerAngle = angleFromCenter(e.clientX, e.clientY)
    dragStartRotation = rotationDegrees
    isDragging = true
    open = true
    fabElement.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent): void {
    if (!isDragging) return
    rotationDegrees =
      dragStartRotation + (angleFromCenter(e.clientX, e.clientY) - dragStartPointerAngle)
  }

  function handlePointerUp(e: PointerEvent): void {
    if (!open) return
    fabElement?.releasePointerCapture(e.pointerId)
    isDragging = false

    const rotatedDegrees = Math.abs(rotationDegrees - dragStartRotation)
    if (rotatedDegrees < TAP_THRESHOLD_DEGREES) {
      rotationDegrees = dragStartRotation - SEGMENT_DEGREES
    }

    rotationDegrees = Math.round(rotationDegrees / SEGMENT_DEGREES) * SEGMENT_DEGREES
    open = false

    const chosenTheme = presetNames[activeIndex]
    applyPreset(chosenTheme)
    setActivePresetName(chosenTheme)
  }

  function handlePointerCancel(e: PointerEvent): void {
    if (!open) return
    fabElement?.releasePointerCapture(e.pointerId)
    isDragging = false
    rotationDegrees = dragStartRotation
    open = false
  }
</script>

<button
  bind:this={fabElement}
  type="button"
  aria-label="Cycle theme, rotate the dial to pick a preset"
  class={cn(
    'glass flex touch-none items-center justify-center rounded-full',
    'border shadow-lg transition-transform select-none active:scale-95',
  )}
  style="
    width: {FAB_SIZE_PIXELS}px;
    height: {FAB_SIZE_PIXELS}px;
    color: var(--iris);
    border-color: color-mix(in srgb, var(--highlight-med) 50%, transparent);
    background: color-mix(in srgb, var(--overlay) 92%, transparent);
  "
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
>
  <Palette size={20} />
</button>

{#if open}
  <div
    class="pointer-events-none fixed z-50"
    style="left: {centerX}px; top: {centerY}px;"
    transition:scale={{ duration: 200, start: 0.85 }}
  >
    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style="
        width: 10px;
        height: 10px;
        left: 0;
        top: {-RING_RADIUS_PIXELS - 20}px;
        background: var(--iris);
        box-shadow: 0 0 8px 1px color-mix(in srgb, var(--iris) 70%, transparent);
      "
    ></div>

    <div
      class="absolute"
      style="
        left: 0;
        top: 0;
        transform: rotate({rotationDegrees}deg);
        transition: {isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'};
      "
    >
      {#each presetNames as name, index (name)}
        {@const angleRadians = (index * SEGMENT_DEGREES * Math.PI) / 180}
        {@const offsetX = RING_RADIUS_PIXELS * Math.sin(angleRadians)}
        {@const offsetY = -RING_RADIUS_PIXELS * Math.cos(angleRadians)}
        {@const isActive = activeIndex === index}
        <div
          class={cn(
            'absolute rounded-full border-2 transition-all duration-150',
            isActive ? 'scale-125' : 'scale-100 opacity-70',
          )}
          style="
            width: 30px;
            height: 30px;
            left: {offsetX - 15}px;
            top: {offsetY - 15}px;
            background: {PRESET_THEMES[name].iris};
            border-color: {isActive ? PRESET_THEMES[name].text : 'transparent'};
            box-shadow: {isActive
            ? `0 0 12px 1px color-mix(in srgb, ${PRESET_THEMES[name].iris} 55%, transparent)`
            : 'none'};
            transform: rotate({-rotationDegrees}deg);
          "
        ></div>
      {/each}
    </div>

    <div
      class={cn(
        'absolute flex -translate-x-1/2 -translate-y-1/2 items-center',
        'justify-center rounded-full text-center',
      )}
      style="
        width: 88px;
        height: 88px;
        background: var(--overlay);
        border: 1px solid color-mix(in srgb, var(--subtle) 25%, transparent);
        box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.5);
      "
    >
      <span
        class="px-2 font-mono text-[0.5625rem] tracking-[0.18em] uppercase"
        style="color: var(--subtle)"
      >
        {presetNames[activeIndex]}
      </span>
    </div>
  </div>
{/if}
