<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { LoaderCircle } from 'lucide-svelte'
  import { createQuery } from '@tanstack/svelte-query'
  import { createGithubClient } from '$lib/entities/github-stats/api/github-client'
  import { GHFETCH_STATS_URL } from '$lib/entities/github-stats/api/config'
  import { warmServerStats } from '$lib/entities/github-stats/api/warm-server-stats'
  import {
    ALLOWED_WALLPAPER_FORMATS,
    type WallpaperFormat,
  } from '$lib/widgets/wallpaper/lib/wallpaper-formats'
  import { buildWallpaperUrl } from '$lib/widgets/wallpaper/lib/wallpaper-url'
  import { downloadWallpaper } from '$lib/widgets/wallpaper/lib/download-wallpaper'
  import { packThemeTokens } from '$lib/widgets/wallpaper/lib/wallpaper-theme-param'
  import WallpaperPreview from '$lib/widgets/wallpaper/ui/WallpaperPreview.svelte'
  import WallpaperExportHeader from '$lib/widgets/wallpaper/ui/WallpaperExportHeader.svelte'
  import WallpaperFormatPicker from '$lib/widgets/wallpaper/ui/WallpaperFormatPicker.svelte'
  import WallpaperExportFooter from '$lib/widgets/wallpaper/ui/WallpaperExportFooter.svelte'
  import { getTokens } from '$lib/entities/theme/model/theme-manager'
  import {
    getActivePresetName,
    getActiveThemeTokens,
    setActiveThemeTokens,
  } from '$lib/entities/theme/model/theme-state.svelte'
  import ThemeControls from '$lib/features/customize-theme/ui/ThemeControls.svelte'
  import { toast } from 'svelte-sonner'

  const SECONDS_PER_MINUTE = 60
  const MILLISECONDS_PER_SECOND = 1000
  const STATS_REQUEST_TIMEOUT_MILLISECONDS = 8000
  const STATS_STALE_TIME_MILLISECONDS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
  const DOWNLOAD_PREWARM_DEBOUNCE_MILLISECONDS = 600
  const LOADING_ICON_SIZE = 20

  const login = $derived(page.url.searchParams.get('username')?.trim() ?? '')

  const statsClient = createGithubClient({
    apiUrl: GHFETCH_STATS_URL,
    requestTimeoutMilliseconds: STATS_REQUEST_TIMEOUT_MILLISECONDS,
  })

  const statsQuery = createQuery(() => ({
    queryKey: ['github-stats', login.toLowerCase()],
    queryFn: async () => {
      const statsFetchResult = await statsClient.fetchStats(login)
      if (!statsFetchResult.ok) throw new Error(statsFetchResult.error.message)

      warmServerStats(login, statsFetchResult.data)
      return statsFetchResult.data
    },
    enabled: login.length > 0,
    staleTime: STATS_STALE_TIME_MILLISECONDS,
  }))

  let selectedFormat = $state<WallpaperFormat>(ALLOWED_WALLPAPER_FORMATS[0])
  let isGenerating = $state(false)

  const theme = $derived(getActiveThemeTokens())
  const presetName = $derived(getActivePresetName())
  const packedCustomTokens = $derived(presetName ? undefined : packThemeTokens(theme))

  const wallpaperUrl = $derived(
    buildWallpaperUrl({
      username: login,
      format: selectedFormat,
      presetName,
      packedCustomTokens,
    }),
  )
  const downloadFilename = $derived(`gitpeak-${login}-${selectedFormat.id}.png`)

  onMount(() => {
    setActiveThemeTokens(getTokens())
  })

  $effect(() => {
    const urlToPrewarm = wallpaperUrl
    if (!statsQuery.data || !login) return

    const timer = setTimeout(() => {
      fetch(urlToPrewarm).catch(() => undefined)
    }, DOWNLOAD_PREWARM_DEBOUNCE_MILLISECONDS)

    return () => {
      clearTimeout(timer)
    }
  })

  function selectFormat(format: WallpaperFormat): void {
    selectedFormat = format
  }

  async function generateWallpaper(): Promise<void> {
    if (isGenerating) return
    isGenerating = true

    try {
      await downloadWallpaper(wallpaperUrl, downloadFilename)
      toast.success('Wallpaper saved!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed — give it a moment and try again.')
    } finally {
      isGenerating = false
    }
  }
</script>

<svelte:head>
  <title>Wallpaper export{login ? ` for ${login}` : ''} | GitPeak</title>
  <meta name="robots" content="noindex" />
</svelte:head>

{#if !login}
  <div class="empty-state">
    <p>No username given.</p>
    <a href="/">Back to GitPeak</a>
  </div>
{:else}
  <div class="page">
    <WallpaperExportHeader {login} />

    <div class="page-body">
      <div class="preview-column">
        <div class="preview-area">
          <div
            class="preview-frame"
            style="aspect-ratio: {selectedFormat.width} / {selectedFormat.height};"
          >
            {#if statsQuery.data}
              <WallpaperPreview
                statistics={statsQuery.data}
                username={login}
                {theme}
                avatarUrl={statsQuery.data.avatarUrl}
                width={selectedFormat.width}
                height={selectedFormat.height}
              />
            {:else if statsQuery.isError}
              <div class="preview-status">
                Couldn’t load {login}’s stats.
              </div>
            {:else}
              <div class="preview-status">
                <LoaderCircle size={LOADING_ICON_SIZE} class="animate-spin" />
                Loading {login}’s stats…
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="controls-column">
        <p class="section-label">Format</p>
        <WallpaperFormatPicker
          formats={ALLOWED_WALLPAPER_FORMATS}
          {selectedFormat}
          onSelectFormat={selectFormat}
        />

        <p class="section-label mt-5">Theme</p>
        <ThemeControls />
      </div>
    </div>

    <WallpaperExportFooter
      formatWidth={selectedFormat.width}
      formatHeight={selectedFormat.height}
      {isGenerating}
      isDownloadDisabled={isGenerating || !statsQuery.data}
      onDownload={generateWallpaper}
    />
  </div>
{/if}

<style>
  .empty-state {
    display: flex;
    min-height: 100dvh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: 'DM Mono', monospace;
    color: var(--subtle);
  }

  .empty-state a {
    color: var(--iris);
  }

  .page {
    display: flex;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    flex-direction: column;
    background: var(--base);
  }

  .page-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    overflow: hidden auto;
    -webkit-overflow-scrolling: touch;
  }

  @media (width >= 768px) {
    .page-body {
      flex-direction: row;
      overflow: hidden;
    }
  }

  .preview-column {
    display: flex;
    flex-shrink: 0;
    min-height: 35vh;
    min-width: 0;
  }

  @media (width >= 768px) {
    .preview-column {
      flex: 1;
      min-height: 0;
    }
  }

  .preview-area {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 24px;
    min-height: 0;
    min-width: 0;
    background: repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--highlight-low) 30%, transparent) 0,
      color-mix(in srgb, var(--highlight-low) 30%, transparent) 1px,
      transparent 1px,
      transparent 12px
    );
  }

  @media (width >= 768px) {
    .preview-area {
      padding: 40px;
    }
  }

  .preview-frame {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    border-radius: 8px;
    box-shadow:
      0 24px 64px -12px rgb(0 0 0 / 65%),
      0 0 0 1px rgb(255 255 255 / 8%) inset;
  }

  .preview-status {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--subtle);
    background: color-mix(in srgb, var(--base) 85%, transparent);
  }

  .controls-column {
    flex-shrink: 0;
    padding: 20px 20px calc(env(safe-area-inset-bottom, 0px) + 120px);
    border-top: 1px solid var(--border-glass-faint);
    background: color-mix(in srgb, var(--base) 40%, transparent);
  }

  @media (width >= 768px) {
    .controls-column {
      width: 420px;
      padding: 24px 24px 80px;
      overflow-y: auto;
      border-top: none;
      border-left: 1px solid var(--border-glass-faint);
    }
  }

  .section-label {
    display: block;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--muted);
    margin-bottom: 10px;
  }

  .section-label.mt-5 {
    margin-top: 24px;
  }
</style>
