const SIMPLE_ICONS: Readonly<Record<string, string>> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  rust: 'rust',
  go: 'go',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
  c: 'c',
  'c++': 'cplusplus',
  'c#': 'dotnet',
  php: 'php',
  dart: 'dart',
  scala: 'scala',
  elixir: 'elixir',
  haskell: 'haskell',
  lua: 'lua',
  shell: 'gnubash',
  bash: 'gnubash',
  html: 'html5',
  css: 'css',
  scss: 'sass',
  sass: 'sass',
  vue: 'vuedotjs',
  svelte: 'svelte',
  astro: 'astro',
  dockerfile: 'docker',
  nix: 'nixos',
  zig: 'zig',
  clojure: 'clojure',
  erlang: 'erlang',
  r: 'r',
  julia: 'julia',
  perl: 'perl',
  ocaml: 'ocaml',
  'f#': 'fsharp',
  groovy: 'apachegroovy',
  markdown: 'markdown',
  'jupyter notebook': 'jupyter',
  typst: 'typst',
  makefile: 'make',
  autohotkey: 'autohotkey',
} as const

const DIRECT_ICONS: Readonly<Record<string, string>> = {
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
} as const

export function langIconUrl(name: string): string {
  const normalizedName = name.trim().toLowerCase()
  if (DIRECT_ICONS[normalizedName]) return DIRECT_ICONS[normalizedName]

  const slug = SIMPLE_ICONS[normalizedName]

  return slug ? `https://cdn.simpleicons.org/${slug}` : ''
}

export function hideImgOnError(e: Event): void {
  const img = e.currentTarget as HTMLImageElement
  img.style.display = 'none'
  const fallback = img.nextElementSibling as HTMLElement | null
  if (fallback) fallback.style.display = 'block'
}
