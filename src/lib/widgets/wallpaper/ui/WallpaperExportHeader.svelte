<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte'

  const BACK_LINK_ICON_SIZE = 15

  type Props = {
    login: string
  }

  const { login }: Props = $props()
</script>

<header class="page-header">
  <a href="/?username={login}" class="back-link" aria-label="Back to {login}'s profile">
    <ArrowLeft size={BACK_LINK_ICON_SIZE} />
  </a>
  <span class="eyebrow">Wallpaper Export</span>
</header>

<style>
  .page-header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px;
    background: color-mix(in srgb, var(--base) 92%, transparent);
    border-bottom: 1px solid var(--border-glass-faint);
    backdrop-filter: blur(10px);
  }

  .back-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    color: var(--subtle);
    background: color-mix(in srgb, var(--highlight-med) 40%, transparent);
    transition: color 0.15s ease;
    touch-action: manipulation;
  }

  .back-link:hover {
    color: var(--iris);
  }

  .eyebrow {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--subtle);
  }
</style>
