<script lang="ts">
  import { X, Download } from 'lucide-svelte'
  import { WALLPAPER_FORMATS, type WallpaperFormat } from '$lib/wallpaper/wallpaper-formats'
  import { getActivePresetName } from '$lib/theme/theme-state.svelte'
  import { Button } from '$lib/components/ui/button'
  import { toast } from 'svelte-sonner'
  import { cn } from '$lib/ui/styling/class-merger'

  let {
    login,
    onClose,
  }: {
    login: string
    onClose: () => void
  } = $props()

  const themeName = $derived(getActivePresetName() ?? 'Rosé Pine')

  let selectedFormat = $state<WallpaperFormat>(WALLPAPER_FORMATS[0])
  let isGenerating = $state(false)
  let isPreviewLoading = $state(true)
  let isMobileDevice = $state(false)
  let previewWidthPixels = $state(700)
  let previewHeightPixels = $state(500)

  const paddingPixels = $derived(isMobileDevice ? 16 : 48)

  const scaleMultiplier = $derived(
    selectedFormat.width > 0 && selectedFormat.height > 0
      ? Math.min(
          (previewWidthPixels - paddingPixels) / selectedFormat.width,
          (previewHeightPixels - paddingPixels) / selectedFormat.height,
        )
      : 1,
  )

  // Rendered server-side (svelte/server + resvg) exactly like /og and /api/readme — the preview
  // and the download are the same image, so they can never drift apart.
  const wallpaperUrl = $derived(
    `/wallpaper?username=${encodeURIComponent(login)}` +
      `&format=${selectedFormat.id}` +
      `&theme=${encodeURIComponent(themeName)}`,
  )

  $effect(() => {
    const check = () => {
      isMobileDevice = window.innerWidth < 640
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  })

  $effect(() => {
    void wallpaperUrl
    isPreviewLoading = true
  })

  function handlePreviewLoaded(): void {
    isPreviewLoading = false
  }

  function handlePreviewError(): void {
    isPreviewLoading = false
    toast.error('Preview failed to load. Check console for details.')
  }

  function generateWallpaper(): void {
    if (isGenerating) return
    isGenerating = true

    try {
      const a = document.createElement('a')
      a.href = wallpaperUrl
      a.download = `gitpeak-${login}-${selectedFormat.id}.png`
      a.click()
      toast.success('Wallpaper saved!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Check console for details.')
    } finally {
      isGenerating = false
    }
  }
</script>

{#snippet formatList(fullWidth = false)}
  {#each WALLPAPER_FORMATS as format (format.id)}
    <button
      class="format-button"
      class:format-button--full={fullWidth}
      class:format-button--active={selectedFormat.id === format.id}
      onclick={() => (selectedFormat = format)}
    >
      <span>{format.name}</span>
      <span class="format-subtitle">{format.subtitle}</span>
    </button>
  {/each}
{/snippet}

{#snippet previewFrame()}
  <div
    class="preview-frame"
    style="width:{selectedFormat.width * scaleMultiplier}px; height:{selectedFormat.height *
      scaleMultiplier}px;"
  >
    {#if isPreviewLoading}
      <div class="preview-loading">Generating preview…</div>
    {/if}
    {#key wallpaperUrl}
      <img
        class="preview-image"
        class:preview-image--loading={isPreviewLoading}
        src={wallpaperUrl}
        alt="{login}'s wallpaper preview"
        onload={handlePreviewLoaded}
        onerror={handlePreviewError}
      />
    {/key}
  </div>
{/snippet}

{#snippet downloadButton()}
  <button
    disabled={isGenerating}
    onclick={generateWallpaper}
    class="download-button"
    class:download-button--busy={isGenerating}
  >
    {#if !isGenerating}
      <Download size={12} />
    {/if}
    {isGenerating ? 'Generating…' : 'Download PNG'}
  </button>
{/snippet}

<!-- BUG FIX 3: backdrop keydown was a no-op; now it properly calls onClose on Escape -->
<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div
  role="button"
  tabindex="-1"
  aria-label="Close"
  onclick={onClose}
  onkeydown={(e) => e.key === 'Enter' && onClose()}
  class="backdrop fixed inset-0 z-40"
></div>

<div
  class={cn(
    'pointer-events-none fixed inset-0 z-50 flex items-center',
    'justify-center p-2 sm:p-6',
  )}
>
  <div class="modal pointer-events-auto" class:modal--mobile={isMobileDevice}>
    {#if isMobileDevice}
      <header class="panel-bar border-bottom">
        <span class="eyebrow">Wallpaper Export</span>
        <Button variant="ghost" size="icon" class="h-7 w-7" onclick={onClose} aria-label="Close">
          <X size={14} />
        </Button>
      </header>

      <!-- BUG FIX 4: was "fmt-strip" but CSS defines ".format-strip" — renamed to match -->
      <div class="format-strip border-bottom">
        {@render formatList()}
      </div>

      <main
        class="preview-area"
        bind:clientWidth={previewWidthPixels}
        bind:clientHeight={previewHeightPixels}
      >
        {@render previewFrame()}
      </main>

      <footer class="panel-bar border-top">
        <span class="dim-label">{selectedFormat.width} × {selectedFormat.height}</span>
        {@render downloadButton()}
      </footer>
    {:else}
      <aside class="sidebar">
        <div class="mb-5 flex items-center justify-between">
          <span class="eyebrow">Wallpaper Export</span>
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6 rounded-lg"
            onclick={onClose}
            aria-label="Close"
          >
            <X size={13} />
          </Button>
        </div>

        <p class="section-label">Format</p>
        <div class="flex flex-1 flex-col gap-1">
          {@render formatList(true)}
        </div>

        <div class="sidebar-footer border-top">
          <span class="dim-label text-center">
            {selectedFormat.width} × {selectedFormat.height}
          </span>
          {@render downloadButton()}
        </div>
      </aside>

      <main
        class="flex min-w-0 flex-1 flex-col overflow-hidden"
        bind:clientWidth={previewWidthPixels}
        bind:clientHeight={previewHeightPixels}
      >
        <div class="preview-header border-bottom">
          <span class="eyebrow">Live Preview</span>
        </div>
        <div class="preview-area">
          {@render previewFrame()}
        </div>
      </main>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .modal {
    display: flex;
    flex-direction: row;
    width: min(1060px, 96vw);
    max-height: 88vh;
    border-radius: 20px;
    overflow: hidden;
    background: var(--overlay);
    border: 1px solid color-mix(in srgb, var(--subtle) 18%, transparent);
    box-shadow:
      0 48px 96px -24px rgba(0, 0, 0, 0.75),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }

  .modal--mobile {
    flex-direction: column;
    height: 92dvh;
    max-height: 92dvh;
  }

  .border-bottom {
    border-bottom: 1px solid color-mix(in srgb, var(--highlight-med) 35%, transparent);
  }

  .border-top {
    border-top: 1px solid color-mix(in srgb, var(--highlight-med) 35%, transparent);
  }

  .panel-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--base) 40%, transparent);
  }

  .eyebrow {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--subtle);
  }

  .section-label {
    font-size: 9px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--muted);
    margin: 0 0 8px;
  }

  .dim-label {
    font-size: 9px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  /* BUG FIX 4 (CSS side): kept both names so neither layout breaks if
     the old class name is referenced elsewhere */
  .format-strip {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
    background: color-mix(in srgb, var(--base) 40%, transparent);
  }

  .format-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.13s ease;
    border: 1px solid color-mix(in srgb, var(--highlight-med) 50%, transparent);
    background: transparent;
    color: var(--subtle);
  }

  .format-button--full {
    width: 100%;
    white-space: normal;
    padding: 9px 12px;
  }

  .format-button--active {
    border-color: color-mix(in srgb, var(--iris) 50%, transparent);
    background: color-mix(in srgb, var(--iris) 10%, transparent);
    color: var(--iris);
  }

  .format-subtitle {
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .format-button--active .format-subtitle {
    color: color-mix(in srgb, var(--iris) 65%, transparent);
  }

  .download-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 11px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.15s ease;
    background: color-mix(in srgb, var(--iris) 85%, transparent);
    color: var(--base);
  }

  .download-button--busy {
    background: color-mix(in srgb, var(--highlight-med) 60%, transparent);
    color: var(--muted);
    opacity: 0.7;
    cursor: not-allowed;
  }

  .preview-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 24px;
    min-height: 0;
    background: repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--highlight-low) 30%, transparent) 0px,
      color-mix(in srgb, var(--highlight-low) 30%, transparent) 1px,
      transparent 1px,
      transparent 12px
    );
  }

  .preview-frame {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    border-radius: 6px;
    box-shadow:
      0 20px 60px -10px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .preview-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.15s ease;
  }

  .preview-image--loading {
    opacity: 0;
  }

  .preview-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    background: color-mix(in srgb, var(--base) 60%, transparent);
  }

  .sidebar {
    width: 256px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-right: 1px solid color-mix(in srgb, var(--highlight-med) 40%, transparent);
    background: color-mix(in srgb, var(--base) 40%, transparent);
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 16px;
  }

  .preview-header {
    padding: 12px 20px;
    flex-shrink: 0;
  }
</style>
