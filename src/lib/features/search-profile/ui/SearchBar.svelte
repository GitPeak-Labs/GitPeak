<script lang="ts">
  import { Search } from 'lucide-svelte'
  import { Input } from '$lib/shared/ui/input'
  import { Button } from '$lib/shared/ui/button'
  import { cn } from '$lib/shared/lib/class-merger'

  const SEARCH_ICON_SIZE_PX = 15

  let { onSearch }: { onSearch: (username: string) => void } = $props()

  let username = $state('')
  let isFocused = $state(false)

  function handleSearch() {
    const trimmed = username.trim()
    if (trimmed) onSearch(trimmed)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') handleSearch()
  }
</script>

<div
  class={cn(
    'glass relative flex w-full max-w-[calc(100vw-24px)]',
    'max-w-lg touch-manipulation items-center',
    'rounded-2xl p-1 transition-all duration-300',
    isFocused && 'focused',
  )}
>
  <div class="flex shrink-0 items-center pr-1 pl-4">
    <Search
      size={SEARCH_ICON_SIZE_PX}
      aria-hidden="true"
      class={cn('search-icon', isFocused && 'search-icon-focused')}
    />
  </div>

  <Input
    bind:value={username}
    onkeydown={handleKeydown}
    onfocus={() => (isFocused = true)}
    onblur={() => (isFocused = false)}
    placeholder="username"
    spellcheck="false"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    enterkeyhint="search"
    style="color: var(--text);"
    class={cn(
      'caret-iris flex-1 touch-manipulation border-none bg-transparent',
      'px-2 py-3 font-mono text-base tracking-wide shadow-none',
      'outline-none placeholder:opacity-30',
      'focus-visible:ring-0 focus-visible:ring-offset-0',
      'sm:text-base',
    )}
  />

  <Button
    onclick={handleSearch}
    variant="ghost"
    class={cn(
      'text-iris! border-iris/25! from-iris/20 to-foam/15 m-0.5 min-h-11',
      'shrink-0 touch-manipulation rounded-xl border bg-linear-to-br px-5',
      'py-2.5 font-mono text-base font-medium tracking-wide uppercase transition-all',
      'duration-200 select-none active:scale-95',
    )}
  >
    peek
  </Button>
</div>

<style>
  .search-icon {
    color: var(--muted);
    transition: color 0.2s ease;
  }

  .search-icon-focused {
    color: var(--iris);
  }

  .peek-button {
    color: var(--iris);
    border-color: color-mix(in srgb, var(--iris) 25%, transparent);
    background: linear-gradient(
      to bottom right,
      color-mix(in srgb, var(--iris) 20%, transparent),
      color-mix(in srgb, var(--foam) 15%, transparent)
    );
  }

  .focused {
    border-color: color-mix(in srgb, var(--subtle) 40%, transparent);
    box-shadow:
      0 0 0 4px color-mix(in srgb, var(--iris) 8%, transparent),
      0 24px 48px -12px rgb(0 0 0 / 50%);
  }
</style>
