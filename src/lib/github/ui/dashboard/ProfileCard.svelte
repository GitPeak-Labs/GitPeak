<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'
  import { ExternalLink, Calendar, Users } from 'lucide-svelte'
  import { Card, CardContent } from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import { cn } from '$lib/ui/styling/class-merger'

  let { statistics, login }: { statistics: GithubStats; login: string } = $props()

  let displayName = $derived(statistics.displayName || login)
</script>

<Card
  class={cn(
    'glass relative isolate overflow-hidden rounded-2xl [clip-path:inset(0_round_1rem)]',
    'transition-[border-color,box-shadow,transform] duration-180 ease-out hover:-translate-y-px',
  )}
  style="clip-path: inset(0 round 1rem); -webkit-clip-path: inset(0 round 1rem);"
>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl [clip-path:inset(0_round_1rem)]"
    style="clip-path: inset(0 round 1rem); -webkit-clip-path: inset(0 round 1rem);"
    aria-hidden="true"
  >
    <div
      class={cn(
        'bg-[color-mix(in_srgb,var(--iris)_15%,transparent)]',
        'absolute -top-12 -left-12 h-44 w-44 rounded-full blur-3xl',
      )}
    ></div>
    <div
      class={cn(
        'bg-[color-mix(in_srgb,var(--foam)_10%,transparent)]',
        'absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl',
      )}
    ></div>
  </div>

  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a
    href="https://github.com/{login}"
    target="_blank"
    rel="external noopener noreferrer"
    aria-label="View {displayName} on GitHub"
    class="block no-underline"
  >
    <CardContent class="relative flex items-start gap-3 p-4 sm:gap-5 sm:p-6">
      <div
        class={cn(
          'border-[color-mix(in_srgb,var(--iris)_30%,transparent)]',
          'ring-[color-mix(in_srgb,var(--iris)_5%,transparent)]',
          'shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]',
          'h-16 w-16 shrink-0 overflow-hidden rounded-2xl border ring-4 sm:h-20 sm:w-20',
        )}
      >
        <img
          src={statistics.avatarUrl}
          crossorigin="anonymous"
          alt="{displayName}'s GitHub avatar"
          width="80"
          height="80"
          class="h-full w-full rounded-2xl object-cover"
          loading="eager"
          decoding="async"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h2
            class={cn(
              'text-(--text)',
              'min-w-0 font-serif text-lg leading-tight font-semibold break-words sm:text-2xl',
            )}
          >
            {displayName}
          </h2>

          <Badge
            variant="outline"
            class={cn(
              'bg-[color-mix(in_srgb,var(--foam)_10%,transparent)]',
              'border-[color-mix(in_srgb,var(--foam)_20%,transparent)]',
              'flex shrink-0 items-center gap-1 px-2 py-1 text-(--foam)',
              'font-mono text-[0.625rem]',
            )}
          >
            <Calendar size={9} />
            {accountAge(statistics.accountCreatedAt)}
          </Badge>
        </div>

        {#if statistics.bio}
          <p class="line-clamp-3 text-xs leading-relaxed break-words text-(--subtle) sm:text-sm">
            {statistics.bio}
          </p>
        {/if}

        <Separator class="my-1 bg-[color-mix(in_srgb,var(--highlight-med)_30%,transparent)]" />

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span
            class={cn(
              'flex min-w-0 items-center gap-1.5 text-(--subtle)',
              'font-mono text-xs transition-colors duration-150',
            )}
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-(--foam)" aria-hidden="true"></span>
            <span class="truncate">github.com/{login}</span>
            <ExternalLink size={9} class="shrink-0" aria-hidden="true" />
          </span>

          <div class="flex shrink-0 items-center gap-3 font-mono text-[0.625rem] text-(--subtle)">
            <span class="flex items-center gap-1">
              <Users size={9} aria-hidden="true" />
              <span class="font-medium text-(--text)">
                {formatNumber(statistics.followers)}
              </span>
              followers
            </span>
            <span>
              <span class="font-medium text-(--text)">
                {formatNumber(statistics.following)}
              </span>
              following
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </a>
</Card>
