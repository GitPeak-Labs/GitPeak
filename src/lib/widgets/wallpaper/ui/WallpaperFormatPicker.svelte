<script lang="ts">
  import type { WallpaperFormat } from '$lib/widgets/wallpaper/lib/wallpaper-formats'

  type Props = {
    formats: WallpaperFormat[]
    selectedFormat: WallpaperFormat
    onSelectFormat: (format: WallpaperFormat) => void
  }

  const { formats, selectedFormat, onSelectFormat }: Props = $props()
</script>

<div class="format-grid">
  {#each formats as format (format.id)}
    <button
      type="button"
      class="format-button"
      class:format-button-active={selectedFormat.id === format.id}
      onclick={() => {
        onSelectFormat(format)
      }}
    >
      <span>{format.name}</span>
      <span class="format-subtitle">{format.subtitle}</span>
    </button>
  {/each}
</div>

<style>
  .format-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .format-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    padding: 12px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.13s ease;
    border: 1px solid var(--border-glass);
    background: transparent;
    color: var(--subtle);
    touch-action: manipulation;
  }

  .format-button-active {
    border-color: color-mix(in srgb, var(--iris) 50%, transparent);
    background: color-mix(in srgb, var(--iris) 10%, transparent);
    color: var(--iris);
  }

  .format-subtitle {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.05em;
    font-weight: 400;
  }

  .format-button-active .format-subtitle {
    color: color-mix(in srgb, var(--iris) 65%, transparent);
  }
</style>
