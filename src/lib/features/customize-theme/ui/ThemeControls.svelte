<script lang="ts">
  import { onMount } from 'svelte'
  import {
    TOKEN_LABELS,
    PRESET_THEMES,
    getTokens,
    applyTokens,
    applyPreset as applyPresetTheme,
    saveCustomTokens,
    getSavedPresetName,
    parseThemeFromCSS,
    type ThemeTokens,
  } from '$lib/entities/theme/model/theme-manager'
  import {
    setActivePresetName,
    setActiveThemeTokens,
  } from '$lib/entities/theme/model/theme-state.svelte'
  import { RotateCcw, ChevronDown } from 'lucide-svelte'
  import { cn } from '$lib/shared/lib/class-merger'

  type ColorPickerChangeEvent = CustomEvent<Record<'value', string>>

  const RESET_ICON_SIZE = 9
  const CHEVRON_ICON_SIZE = 10
  const DASHED_BUTTON_CLASSES = cn(
    'flex cursor-pointer items-center gap-1 rounded-lg',
    'px-2.5 py-1 font-mono text-[0.625rem] transition-all',
    'duration-150',
  )

  let tokens = $state<ThemeTokens>({ ...PRESET_THEMES['Rosé Pine'] })
  let activePreset = $state<string | null>(null)
  let activeKey = $state<string | null>(null)
  let isColorsOpen = $state(false)

  const tokenKeys = Object.keys(TOKEN_LABELS)

  $effect(() => {
    setActiveThemeTokens(tokens)
  })

  onMount(async () => {
    tokens = { ...getTokens() }
    const saved = getSavedPresetName()
    activePreset =
      saved || (localStorage.getItem('gitpeak-theme') === 'custom' ? null : 'Rosé Pine')
    await import('vanilla-colorful/hex-color-picker.js')
  })

  function update(key: string, colorValue: string) {
    tokens = { ...tokens, [key]: colorValue }
    activePreset = null
    applyTokens(tokens)
    saveCustomTokens(tokens)
    setActivePresetName(null)
  }

  function applyPreset(name: string) {
    activePreset = name
    tokens = { ...PRESET_THEMES[name] }
    applyPresetTheme(name)
    setActivePresetName(name)
  }

  function reset() {
    applyPreset('Rosé Pine')
  }

  function importCSS(fileInputChangeEvent: Event) {
    const file = (fileInputChangeEvent.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const css = reader.result as string
      const parsed = parseThemeFromCSS(css)
      if (Object.keys(parsed).length === 0) {
        alert('No theme tokens found in CSS file.')
        return
      }
      tokens = { ...PRESET_THEMES['Rosé Pine'], ...parsed }
      activePreset = null
      applyTokens(tokens)
      saveCustomTokens(tokens)
      setActivePresetName(null)
    }
    reader.readAsText(file)
  }

  function exportCSS() {
    const lines = [
      '/* GitPeak Custom Theme */',
      '/* Import this file in the theme customizer */',
      '',
      ':root {',
      ...Object.entries(tokens).map(([key, tokenValue]) => `  --${key}: ${tokenValue};`),
      '}',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.href = url
    downloadAnchor.download = 'gitpeak-theme.css'
    downloadAnchor.click()
    URL.revokeObjectURL(url)
  }

  function onPickerChange(pickerChangeEvent: Event, key: string) {
    const pickedColor = (pickerChangeEvent as ColorPickerChangeEvent).detail.value
    if (pickedColor) update(key, pickedColor)
  }
</script>

<div class="flex flex-col gap-5">
  <div>
    <div class="mb-2 flex items-center justify-between">
      <span
        class="font-mono text-[0.5625rem] tracking-[0.18em] uppercase"
        style="color: var(--muted)"
      >
        Presets
      </span>
      <button
        type="button"
        onclick={reset}
        class={cn(
          'disclosure-btn -mx-1 flex items-center gap-1 rounded px-1.5 py-0.5',
          'font-mono text-[0.5625rem] tracking-[0.1em] uppercase transition-colors',
        )}
        style="color: var(--muted)"
      >
        <RotateCcw size={RESET_ICON_SIZE} />
        reset
      </button>
    </div>
    <div class="flex flex-wrap gap-1.5">
      {#each Object.keys(PRESET_THEMES) as name (name)}
        <button
          type="button"
          onclick={() => {
            applyPreset(name)
          }}
          class={cn(
            'touch-manipulation rounded-lg border px-2.5 py-1 font-mono text-[0.625rem]',
            'transition-all duration-150',
          )}
          style="
          border-color: {activePreset === name
            ? 'color-mix(in srgb, var(--iris) 60%, transparent)'
            : 'var(--border-glass)'};
          color: {activePreset === name ? 'var(--iris)' : 'var(--subtle)'};
          background: {activePreset === name
            ? 'color-mix(in srgb, var(--iris) 10%, transparent)'
            : 'transparent'};
        "
        >
          {name}
        </button>
      {/each}

      <label
        class={DASHED_BUTTON_CLASSES}
        style="
        border: 1px dashed var(--border-glass);
        color: var(--muted);
      "
      >
        + import CSS
        <input type="file" accept=".css" class="hidden" onchange={importCSS} />
      </label>

      <button
        type="button"
        onclick={exportCSS}
        class={DASHED_BUTTON_CLASSES}
        style="
        border: 1px dashed var(--border-glass);
        color: var(--muted);
      "
      >
        ↓ export CSS
      </button>
    </div>
  </div>

  <div>
    <button
      type="button"
      onclick={() => (isColorsOpen = !isColorsOpen)}
      class={cn(
        'disclosure-btn -mx-1 mb-2 flex items-center gap-1.5 rounded px-1.5 py-1',
        'font-mono text-[0.5625rem] tracking-[0.18em] uppercase',
      )}
      style="color: var(--muted)"
    >
      <ChevronDown
        size={CHEVRON_ICON_SIZE}
        class={cn('transition-transform duration-150', !isColorsOpen && '-rotate-90')}
      />
      Custom Colors
    </button>
    {#if isColorsOpen}
      <div class="grid grid-cols-1 gap-1">
        {#each tokenKeys as key (key)}
          <div class="flex flex-col">
            <div class="flex items-center justify-between gap-3 py-1">
              <span class="truncate font-mono text-[0.625rem]" style="color: var(--subtle)">
                {TOKEN_LABELS[key]}
              </span>
              <div class="flex shrink-0 items-center gap-2">
                <input
                  type="text"
                  value={tokens[key]}
                  onchange={(hexInputChangeEvent) => {
                    const trimmedHexValue = (
                      hexInputChangeEvent.target as HTMLInputElement
                    ).value.trim()
                    if (/^#[0-9a-fA-F]{6}$/.test(trimmedHexValue)) update(key, trimmedHexValue)
                  }}
                  class={cn(
                    'w-[84px] rounded-lg px-2 py-1 text-center font-mono',
                    'transition-all outline-none',
                  )}
                  style="
                  background: color-mix(in srgb, var(--overlay) 80%, transparent);
                  border: 1px solid var(--border-glass);
                  color: var(--subtle);
                  font-size: 0.6875rem;
                "
                  spellcheck="false"
                  maxlength="7"
                />
                <button
                  type="button"
                  aria-label="Pick color for {TOKEN_LABELS[key]}"
                  onclick={() => (activeKey = activeKey === key ? null : key)}
                  class="h-7 w-7 shrink-0 touch-manipulation rounded-lg transition-all"
                  style="
                  background: {tokens[key]};
                  border: 1px solid color-mix(in srgb,
                    var(--highlight-high) 50%, transparent);
                  box-shadow: {activeKey === key
                    ? '0 0 0 2px var(--iris)'
                    : `0 0 0 2px color-mix(in srgb,
                       ${tokens[key]} 30%, transparent)`};
                "
                ></button>
              </div>
            </div>

            {#if activeKey === key}
              <div class="pt-1 pb-2">
                <hex-color-picker
                  color={tokens[key]}
                  oncolor-changed={(colorPickerChangeEvent: Event) => {
                    onPickerChange(colorPickerChangeEvent, key)
                  }}
                  style="width: 100%; height: 160px;"
                ></hex-color-picker>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  hex-color-picker {
    --cp-border-radius: 10px;
  }

  .disclosure-btn {
    outline: none;
    transition: color 0.15s ease;
    touch-action: manipulation;
  }

  .disclosure-btn:hover {
    color: var(--subtle);
  }

  .disclosure-btn:focus-visible {
    outline: 1px solid color-mix(in srgb, var(--iris) 55%, transparent);
    outline-offset: 2px;
  }
</style>
