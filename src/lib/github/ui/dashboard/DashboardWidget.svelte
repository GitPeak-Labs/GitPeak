<script lang="ts">
  import ProfileCard from '$lib/github/ui/dashboard/ProfileCard.svelte'
  import StatGrid from '$lib/github/ui/dashboard/StatGrid.svelte'
  import LanguagePie from '$lib/github/ui/language-breakdown/LanguagePie.svelte'
  import MostStarredRepo from '$lib/github/ui/dashboard/MostStarredRepo.svelte'
  import { Download } from 'lucide-svelte'
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { cn } from '$lib/ui/styling/class-merger'

  let {
    statistics,
    username,
  }: {
    statistics: GithubStats
    username: string
  } = $props()
</script>

<div class="mx-auto w-full max-w-275">
  <div class="fade-in-up mb-4 flex w-full justify-end [animation-delay:60ms]">
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <a
      href="/wallpaper/export?username={username}"
      class={cn(
        'bg-surface/60 border-highlight-med/50 text-subtle flex items-center gap-2',
        'rounded-xl border px-3 py-2 font-mono text-xs tracking-[0.05em]',
        'uppercase backdrop-blur-md transition-all duration-200 active:scale-95',
      )}
      aria-label="Export wallpaper"
    >
      <Download size={13} />
      <span>Wallpaper</span>
    </a>
    <!-- eslint-enable svelte/no-navigation-without-resolve -->
  </div>

  <div
    class={cn(
      'grid touch-pan-y grid-cols-1 items-start gap-3 sm:gap-4',
      'md:grid-cols-[1.05fr_1fr]',
    )}
  >
    <div class="fade-in-up flex touch-pan-y flex-col gap-3.5 sm:gap-4">
      <ProfileCard {statistics} login={username} />
      <StatGrid {statistics} />
    </div>

    <div class="fade-in-up flex touch-pan-y flex-col gap-3.5 [animation-delay:80ms] sm:gap-4">
      {#if statistics.languages?.length > 0}
        <LanguagePie
          languages={statistics.languages}
          avatarUrl={statistics.avatarUrl}
          involvedRepos={statistics.involvedRepos}
          collaborators={statistics.collaborators}
        />
      {/if}

      {#if statistics.mostStarredRepo}
        <MostStarredRepo repository={statistics.mostStarredRepo} />
      {/if}
    </div>
  </div>
</div>
