<script lang="ts">
  import { scale } from 'svelte/transition'
  import {
    PRESET_THEMES,
    applyPreset,
    previewPreset,
  } from '$lib/entities/theme/model/theme-manager'
  import {
    getActivePresetName,
    setActivePresetName,
  } from '$lib/entities/theme/model/theme-state.svelte'
  import { Palette } from 'lucide-svelte'
  import { cn } from '$lib/shared/lib/class-merger'

  const FULL_CIRCLE_DEGREES = 360
  const HALF_CIRCLE_DEGREES = 180
  const RING_RADIUS_PIXELS = 104
  const FAB_SIZE_PIXELS = 52
  const TAP_THRESHOLD_DEGREES = 8
  const FAB_PRESSED_SCALE = 0.85
  const PALETTE_ICON_SIZE = 20
  const CENTER_CIRCLE_SIZE_PIXELS = 88
  const INDICATOR_OFFSET_PIXELS = 20
  const SEGMENT_DOT_RADIUS_PIXELS = 15

  const presetNames = Object.keys(PRESET_THEMES)
  const SEGMENT_DEGREES = FULL_CIRCLE_DEGREES / presetNames.length

  let fabElement: HTMLButtonElement | undefined = $state()
  let isOpen = $state(false)
  let isDragging = $state(false)
  let centerX = $state(0)
  let centerY = $state(0)
  let rotationDegrees = $state(0)

  let dragStartPointerAngle = 0
  let dragStartRotation = 0

  const currentPresetName = $derived(getActivePresetName() ?? 'Rosé Pine')

  const activeIndex = $derived.by(() => {
    const normalizedDegrees =
      ((-rotationDegrees % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES
    return Math.round(normalizedDegrees / SEGMENT_DEGREES) % presetNames.length
  })

  $effect(() => {
    if (!isOpen) return
    const theme = presetNames[activeIndex]
    previewPreset(theme)
    setActivePresetName(theme)
  })

  function angleFromCenter(clientX: number, clientY: number): number {
    return (Math.atan2(clientY - centerY, clientX - centerX) * HALF_CIRCLE_DEGREES) / Math.PI
  }

  function alignRotationToCurrentPreset(): number {
    const activePresetIndex = Math.max(0, presetNames.indexOf(currentPresetName))
    return -activePresetIndex * SEGMENT_DEGREES
  }

  function handlePointerDown(pointerDownEvent: PointerEvent): void {
    if (!fabElement) return

    const rect = fabElement.getBoundingClientRect()
    centerX = rect.left + rect.width / 2
    centerY = rect.top + rect.height / 2

    rotationDegrees = alignRotationToCurrentPreset()

    dragStartPointerAngle = angleFromCenter(pointerDownEvent.clientX, pointerDownEvent.clientY)
    dragStartRotation = rotationDegrees
    isDragging = true
    isOpen = true
    fabElement.setPointerCapture(pointerDownEvent.pointerId)
  }

  function handlePointerMove(pointerMoveEvent: PointerEvent): void {
    if (!isDragging) return
    rotationDegrees =
      dragStartRotation +
      (angleFromCenter(pointerMoveEvent.clientX, pointerMoveEvent.clientY) - dragStartPointerAngle)
  }

  function handlePointerUp(pointerUpEvent: PointerEvent): void {
    if (!isOpen) return
    fabElement?.releasePointerCapture(pointerUpEvent.pointerId)
    isDragging = false

    const rotatedDegrees = Math.abs(rotationDegrees - dragStartRotation)
    if (rotatedDegrees < TAP_THRESHOLD_DEGREES) {
      rotationDegrees = dragStartRotation - SEGMENT_DEGREES
    }

    rotationDegrees = Math.round(rotationDegrees / SEGMENT_DEGREES) * SEGMENT_DEGREES
    isOpen = false

    const chosenTheme = presetNames[activeIndex]
    applyPreset(chosenTheme)
    setActivePresetName(chosenTheme)
  }

  function handlePointerCancel(pointerCancelEvent: PointerEvent): void {
    if (!isOpen) return
    fabElement?.releasePointerCapture(pointerCancelEvent.pointerId)
    isDragging = false
    rotationDegrees = dragStartRotation
    isOpen = false
  }
</script>

<button
  bind:this={fabElement}
  type="button"
  aria-label="Cycle theme, rotate the dial to pick a preset"
  class={cn(
    'glass flex touch-none items-center justify-center rounded-full',
    'border shadow-lg select-none',
  )}
  style="
    width: {FAB_SIZE_PIXELS}px;
    height: {FAB_SIZE_PIXELS}px;
    color: var(--iris);
    border-color: var(--border-glass);
    background: color-mix(in srgb, var(--overlay) 92%, transparent);
    opacity: {isOpen ? 0 : 1};
    transform: scale({isOpen ? FAB_PRESSED_SCALE : 1});
    transition: opacity 160ms ease, transform 160ms ease;
  "
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
>
  <Palette size={PALETTE_ICON_SIZE} />
</button>

{#if isOpen}
  <div
    class="pointer-events-none fixed z-50"
    style="left: {centerX}px; top: {centerY}px;"
    transition:scale={{ duration: 220, start: FAB_SIZE_PIXELS / CENTER_CIRCLE_SIZE_PIXELS }}
  >
    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style="
        width: {RING_RADIUS_PIXELS * 2}px;
        height: {RING_RADIUS_PIXELS * 2}px;
        left: 0;
        top: 0;
        border: 1px solid var(--border-glass-faint);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--base) 40%, transparent);
      "
    ></div>

    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style="
        width: 10px;
        height: 10px;
        left: 0;
        top: {-RING_RADIUS_PIXELS - INDICATOR_OFFSET_PIXELS}px;
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
        {@const angleRadians = (index * SEGMENT_DEGREES * Math.PI) / HALF_CIRCLE_DEGREES}
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
            left: {offsetX - SEGMENT_DOT_RADIUS_PIXELS}px;
            top: {offsetY - SEGMENT_DOT_RADIUS_PIXELS}px;
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
        'glass absolute flex -translate-x-1/2 -translate-y-1/2 items-center',
        'justify-center rounded-full text-center',
      )}
      style="
        width: {CENTER_CIRCLE_SIZE_PIXELS}px;
        height: {CENTER_CIRCLE_SIZE_PIXELS}px;
        background: color-mix(in srgb, var(--overlay) 92%, transparent);
        border: 1px solid var(--border-glass);
        box-shadow: 0 12px 32px -8px rgb(0 0 0 / 50%);
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
