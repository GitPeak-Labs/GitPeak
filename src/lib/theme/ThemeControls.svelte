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
  } from '$lib/theme/theme-manager'
  import { setActivePresetName } from '$lib/theme/theme-state.svelte'
  import { RotateCcw, ChevronDown } from 'lucide-svelte'
  import { cn } from '$lib/ui/styling/class-merger'

  let tokens = $state<ThemeTokens>({ ...PRESET_THEMES['Rosé Pine'] })
  let activePreset = $state<string | null>(null)
  let activeKey = $state<string | null>(null)
  let presetsOpen = $state(true)
  let colorsOpen = $state(false)

  const tokenKeys = Object.keys(TOKEN_LABELS)

  onMount(async () => {
    tokens = { ...getTokens() }
    const saved = getSavedPresetName()
    activePreset =
      saved || (localStorage.getItem('gitpeak-theme') === 'custom' ? null : 'Rosé Pine')
    await import('vanilla-colorful/hex-color-picker.js')
  })

  function update(key: string, value: string) {
    tokens = { ...tokens, [key]: value }
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

  function importCSS(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const css = reader.result as string
      const parsed = parseThemeFromCSS(css)
      if (Object.keys(parsed).length === 0) {
        alert('No theme tokens found in CSS file.')
        return
      }
      tokens = { ...PRESET_THEMES['Rosé Pine'], ...parsed } as ThemeTokens
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
      ...Object.entries(tokens).map(([key, value]) => `  --${key}: ${value};`),
      '}',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gitpeak-theme.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  function onPickerChange(e: Event, key: string) {
    const value = (e as CustomEvent).detail.value
    if (value) update(key, value)
  }
</script>

<div class="flex flex-col gap-5">
  <div>
    <div class="mb-2 flex items-center justify-between">
      <button
        onclick={() => (presetsOpen = !presetsOpen)}
        class={cn(
          'disclosure-btn -mx-1 flex items-center gap-1 rounded px-1 py-0.5',
          'font-mono text-[9px] tracking-[0.18em] uppercase',
        )}
        style="color: var(--muted)"
      >
        <ChevronDown
          size={10}
          class={cn('transition-transform duration-150', !presetsOpen && '-rotate-90')}
        />
        Presets
      </button>
      <button
        onclick={reset}
        class={cn(
          'disclosure-btn -mx-1 flex items-center gap-1 rounded px-1 py-0.5',
          'font-mono text-[9px] tracking-[0.1em] uppercase transition-colors',
        )}
        style="color: var(--muted)"
      >
        <RotateCcw size={9} />
        reset
      </button>
    </div>
    {#if presetsOpen}
      <div class="flex flex-wrap gap-1.5">
        {#each Object.keys(PRESET_THEMES) as name (name)}
          <button
            onclick={() => applyPreset(name)}
            class={cn(
              'rounded-lg border px-2.5 py-1 font-mono text-[10px]',
              'transition-all duration-150',
            )}
            style="
            border-color: {activePreset === name
              ? 'color-mix(in srgb, var(--iris) 60%, transparent)'
              : 'color-mix(in srgb, var(--highlight-med) 50%, transparent)'};
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
          class={cn(
            'flex cursor-pointer items-center gap-1 rounded-lg',
            'px-2.5 py-1 font-mono text-[10px] transition-all',
            'duration-150',
          )}
          style="
          border: 1px dashed color-mix(in srgb,
            var(--highlight-med) 50%, transparent);
          color: var(--muted);
        "
        >
          + import CSS
          <input type="file" accept=".css" class="hidden" onchange={importCSS} />
        </label>

        <button
          onclick={exportCSS}
          class={cn(
            'flex cursor-pointer items-center gap-1 rounded-lg',
            'px-2.5 py-1 font-mono text-[10px] transition-all',
            'duration-150',
          )}
          style="
          border: 1px dashed color-mix(in srgb,
            var(--highlight-med) 50%, transparent);
          color: var(--muted);
        "
        >
          ↓ export CSS
        </button>
      </div>
    {/if}
  </div>

  <div>
    <button
      onclick={() => (colorsOpen = !colorsOpen)}
      class={cn(
        'disclosure-btn -mx-1 mb-2 flex items-center gap-1 rounded px-1 py-0.5',
        'font-mono text-[9px] tracking-[0.18em] uppercase',
      )}
      style="color: var(--muted)"
    >
      <ChevronDown
        size={10}
        class={cn('transition-transform duration-150', !colorsOpen && '-rotate-90')}
      />
      Colors
    </button>
    {#if colorsOpen}
      <div class="grid grid-cols-1 gap-1">
        {#each tokenKeys as key (key)}
          <div class="flex flex-col">
            <div class="flex items-center justify-between gap-3 py-1">
              <span class="font-mono text-[10px]" style="color: var(--subtle)">
                {TOKEN_LABELS[key]}
              </span>
              <div class="flex shrink-0 items-center gap-2">
                <!-- Hex input -->
                <input
                  type="text"
                  value={tokens[key]}
                  onchange={(e) => {
                    const value = (e.target as HTMLInputElement).value.trim()
                    if (/^#[0-9a-fA-F]{6}$/.test(value)) update(key, value)
                  }}
                  class={cn(
                    'w-20 rounded-lg px-2 py-1 text-right font-mono',
                    'text-[10px] transition-all outline-none',
                  )}
                  style="
                  background: color-mix(in srgb, var(--overlay) 80%, transparent);
                  border: 1px solid color-mix(in srgb,
                    var(--highlight-med) 50%, transparent);
                  color: var(--subtle);
                "
                  spellcheck="false"
                  maxlength="7"
                />
                <button
                  aria-label="Pick color for {TOKEN_LABELS[key]}"
                  onclick={() => (activeKey = activeKey === key ? null : key)}
                  class="h-7 w-7 shrink-0 rounded-lg transition-all"
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
                  oncolor-changed={(e: Event) => onPickerChange(e, key)}
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
  }

  .disclosure-btn:hover {
    color: var(--subtle);
  }

  .disclosure-btn:focus-visible {
    outline: 1px solid color-mix(in srgb, var(--iris) 55%, transparent);
    outline-offset: 2px;
  }
</style>
