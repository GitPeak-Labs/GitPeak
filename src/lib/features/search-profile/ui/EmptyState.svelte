<script lang="ts">
  import { UserX, CircleAlert, WifiOff } from 'lucide-svelte'
  import { cn } from '$lib/shared/lib/class-merger'

  let {
    username,
    error,
  }: {
    username: string
    error?: string | null
  } = $props()

  const isNetworkError = $derived(
    (error?.toLowerCase().includes('network') ?? false) ||
      (error?.toLowerCase().includes('connection') ?? false),
  )
  const isNotFound = $derived(!error || error.toLowerCase().includes('not found'))

  const title = $derived(
    isNotFound ? 'User not found' : isNetworkError ? 'Connection failed' : 'Something went wrong',
  )
</script>

<div
  class={cn(
    'glass fade-in-up flex w-full max-w-sm flex-col',
    'items-center gap-4 rounded-2xl px-8 py-12 text-center',
  )}
>
  <div
    class="
    bg-surface border-highlight-med mb-2 flex h-12 w-12 items-center
    justify-center rounded-full border
  "
  >
    {#if isNetworkError}
      <WifiOff class="text-rose h-6 w-6" />
    {:else if isNotFound}
      <UserX class="text-muted h-6 w-6" />
    {:else}
      <CircleAlert class="text-gold h-6 w-6" />
    {/if}
  </div>
  <div>
    <h3 class="text-rp-text mb-1 text-lg font-medium">{title}</h3>

    {#if isNotFound}
      <p class="text-subtle font-mono text-sm leading-relaxed">
        No GitHub profile for
        <span class="text-rp-text font-semibold">
          @{username}
        </span>. Check the spelling and try again.
      </p>
    {:else}
      <p class="text-subtle font-mono text-sm leading-relaxed">
        {error || 'An unexpected error occurred. Please try again later.'}
      </p>
    {/if}
  </div>
</div>
