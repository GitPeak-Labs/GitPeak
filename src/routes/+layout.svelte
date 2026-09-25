<script lang="ts">
  import '../app.css'
  import { Toaster } from 'svelte-sonner'
  import { onMount, type Snippet } from 'svelte'
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import { initTheme } from '$lib/entities/theme/model/theme-manager'

  let { children }: { children: Snippet } = $props()

  onMount(() => {
    initTheme()
  })

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  const toastStyle = [
    'background: #26233a',
    'border: 1px solid rgba(144,140,170,0.25)',
    'color: #e0def4',
    "font-family: 'DM Mono', monospace",
    'font-size: 13px',
    'border-radius: 14px',
  ].join(';')
</script>

<QueryClientProvider client={queryClient}>
  <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />

  {@render children()}
</QueryClientProvider>
