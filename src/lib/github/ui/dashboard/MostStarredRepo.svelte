<script lang="ts">
  import type { MostStarredRepo } from '$lib/github/models/github-stats'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { Star, ArrowUpRight } from 'lucide-svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { Card, CardContent } from '$lib/components/ui/card'
  import { cn } from '$lib/ui/styling/class-merger'

  let { repository }: { repository: MostStarredRepo } = $props()
</script>

{#if repository}
  <Card
    class={cn(
      'glass overflow-hidden rounded-2xl transition-[border-color,box-shadow,transform]',
      'duration-180 ease-out hover:-translate-y-px',
    )}
  >
    <a
      href={repository?.url}
      target="_blank"
      rel="external noopener noreferrer"
      class="block no-underline"
    >
      <CardContent class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <span class="font-mono text-[0.5625rem] tracking-[0.2em] text-(--muted) uppercase">
              ★ most starred repository
            </span>
            <span class="truncate font-serif text-lg leading-tight font-semibold text-(--text)">
              {repository?.name}
            </span>

            <div class="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                class={cn(
                  'bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]',
                  'border-[color-mix(in_srgb,var(--gold)_20%,transparent)]',
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-(--gold)',
                )}
              >
                <Star size={12} class="fill-(--gold)" />
                {formatNumber(repository?.stars ?? 0)}
              </Badge>
              <span class="font-mono text-[0.625rem] text-(--muted)">stars</span>
            </div>
          </div>

          <div
            class={cn(
              'bg-[color-mix(in_srgb,var(--highlight-med)_60%,transparent)]',
              'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-(--muted)',
              'transition-colors duration-150',
            )}
            aria-hidden="true"
          >
            <ArrowUpRight size={15} />
          </div>
        </div>
      </CardContent>
    </a>
  </Card>
{/if}
