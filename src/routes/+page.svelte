<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { useSearch } from '$lib/github/ui/search/useSearch.svelte'
  import SearchBar from '$lib/github/ui/search/SearchBar.svelte'
  import EmptyState from '$lib/github/ui/search/EmptyState.svelte'
  import DashboardWidget from '$lib/github/ui/dashboard/DashboardWidget.svelte'
  import DashboardSkeleton from '$lib/ui/components/DashboardSkeleton.svelte'
  import ThemeCustomizer from '$lib/theme/ThemeCustomizer.svelte'
  import WallpaperExporter from '$lib/exporter/WallpaperExporter.svelte'

  const searchManager = useSearch()

  let showExporter = $state(false)
  let usernameFromUrl = $derived(page.url.searchParams.get('username'))

  $effect(() => {
    const shouldTriggerSearch =
      usernameFromUrl && usernameFromUrl !== searchManager.currentUsername && !searchManager.loading

    if (!shouldTriggerSearch) return

    searchManager.onSearch(usernameFromUrl)
  })

  function handleSearchSubmit(username: string) {
    const targetUrl = `/?username=${encodeURIComponent(username)}`

    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(targetUrl, { keepFocus: true, noScroll: true })
    searchManager.onSearch(username)
  }
</script>

<svelte:head>
  {#if usernameFromUrl}
    <title>{usernameFromUrl}'s GitHub Statistics | GitPeak</title>
    <meta property="og:title" content="{usernameFromUrl}'s GitHub Statistics | GitPeak" />
    <meta
      property="og:description"
      content={`Peek at ${usernameFromUrl}'s GitHub profile statistics, ` +
        'languages, and top repositories.'}
    />
    <meta property="og:image" content="{page.url.origin}/og?username={usernameFromUrl}&v=1" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{usernameFromUrl}'s GitHub Statistics | GitPeak" />
    <meta name="twitter:image" content="{page.url.origin}/og?username={usernameFromUrl}&v=1" />
  {:else}
    <title>GitPeak — Peek at any GitHub profile, beautifully</title>
    <meta property="og:title" content="GitPeak — Peek at any GitHub profile, beautifully" />
    <meta property="og:image" content="{page.url.origin}/favicon.svg" />
  {/if}
</svelte:head>

<div class="aurora-bg" aria-hidden="true"></div>

{#if !showExporter}
  <div class="fixed top-4 right-4 z-50">
    <ThemeCustomizer />
  </div>
{/if}

<main
  class={'mx-auto flex min-h-screen w-full max-w-[100vw] flex-col items-center ' +
    'gap-8 overflow-x-hidden p-10 sm:p-16 md:gap-12 md:p-20'}
>
  <header class="fade-in-up flex flex-col items-center gap-2 px-2 text-center">
    <span
      class="text-subtle font-mono text-[0.7rem] tracking-[0.2em] uppercase"
      aria-label="GitHub Statistics"
    >
      github statistics
    </span>
    <h1
      class={'font-serif text-[2.5rem] leading-none tracking-[-0.02em] ' +
        'sm:text-[3rem] md:text-[4.5rem]'}
    >
      <span class="gradient-text">GitPeak</span>
    </h1>
    <p class="text-subtle mt-1 font-mono text-xs tracking-wider">
      peek at any github profile beautifully
    </p>
  </header>

  <div class="fade-in-up flex w-full justify-center px-2 [animation-delay:80ms]">
    <SearchBar onSearch={handleSearchSubmit} />
  </div>

  {#if searchManager.loading}
    <DashboardSkeleton />
  {/if}

  {#if searchManager.stats}
    <DashboardWidget
      statistics={searchManager.stats}
      username={searchManager.currentUsername}
      onExport={() => (showExporter = true)}
    />
  {/if}

  {#if searchManager.noResults}
    <EmptyState username={searchManager.currentUsername} error={searchManager.error} />
  {/if}
</main>

{#if showExporter && searchManager.stats}
  <WallpaperExporter login={searchManager.currentUsername} onClose={() => (showExporter = false)} />
{/if}
