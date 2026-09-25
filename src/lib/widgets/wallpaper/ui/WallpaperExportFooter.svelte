<script lang="ts">
  import { Download } from 'lucide-svelte'

  const DOWNLOAD_ICON_SIZE = 12

  type Props = {
    formatWidth: number
    formatHeight: number
    isGenerating: boolean
    isDownloadDisabled: boolean
    onDownload: () => void
  }

  const { formatWidth, formatHeight, isGenerating, isDownloadDisabled, onDownload }: Props =
    $props()
</script>

<footer class="page-footer">
  <span class="dim-label">{formatWidth} × {formatHeight}</span>
  <button
    type="button"
    disabled={isDownloadDisabled}
    onclick={onDownload}
    class="download-button"
    class:download-button-busy={isGenerating}
  >
    {#if !isGenerating}
      <Download size={DOWNLOAD_ICON_SIZE} />
    {/if}
    {isGenerating ? 'Generating…' : 'Download PNG'}
  </button>
</footer>

<style>
  .page-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
    background: color-mix(in srgb, var(--base) 92%, transparent);
    border-top: 1px solid var(--border-glass-faint);
    backdrop-filter: blur(10px);
  }

  .dim-label {
    font-size: 9px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    white-space: nowrap;
  }

  .download-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px 20px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.15s ease;
    touch-action: manipulation;
    background: color-mix(in srgb, var(--iris) 85%, transparent);
    color: var(--base);
  }

  .download-button-busy {
    background: color-mix(in srgb, var(--highlight-med) 60%, transparent);
    color: var(--muted);
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
