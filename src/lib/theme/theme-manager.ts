export type ThemeTokens = Record<string, string>

export const PRESET_THEMES: Record<string, ThemeTokens> = {
  'Rosé Pine': {
    base: '#191724',
    surface: '#1f1d2e',
    overlay: '#26233a',
    muted: '#6e6a86',
    subtle: '#908caa',
    text: '#e0def4',
    love: '#eb6f92',
    gold: '#f6c177',
    rose: '#ebbcba',
    pine: '#31748f',
    foam: '#9ccfd8',
    iris: '#c4a7e7',
    'highlight-low': '#21202e',
    'highlight-med': '#403d52',
    'highlight-high': '#524f67',
  },
  'Rosé Pine Moon': {
    base: '#232136',
    surface: '#2a273f',
    overlay: '#393552',
    muted: '#6e6a86',
    subtle: '#908caa',
    text: '#e0def4',
    love: '#eb6f92',
    gold: '#f6c177',
    rose: '#ea9a97',
    pine: '#3e8fb0',
    foam: '#9ccfd8',
    iris: '#c4a7e7',
    'highlight-low': '#2a283e',
    'highlight-med': '#44415a',
    'highlight-high': '#56526e',
  },
  'Rosé Pine Dawn': {
    base: '#faf4ed',
    surface: '#fffaf3',
    overlay: '#f2e9e1',
    muted: '#9893a5',
    subtle: '#797593',
    text: '#575279',
    love: '#b4637a',
    gold: '#ea9d34',
    rose: '#d7827a',
    pine: '#286983',
    foam: '#56949f',
    iris: '#907aa9',
    'highlight-low': '#f4ede8',
    'highlight-med': '#dfdad9',
    'highlight-high': '#cecacd',
  },
  'Catppuccin Mocha': {
    base: '#1e1e2e',
    surface: '#181825',
    overlay: '#313244',
    muted: '#6c7086',
    subtle: '#a6adc8',
    text: '#cdd6f4',
    love: '#f38ba8',
    gold: '#f9e2af',
    rose: '#f5c2e7',
    pine: '#89b4fa',
    foam: '#89dceb',
    iris: '#cba6f7',
    'highlight-low': '#1e1e2e',
    'highlight-med': '#313244',
    'highlight-high': '#45475a',
  },
  'Catppuccin Latte': {
    base: '#eff1f5',
    surface: '#e6e9ef',
    overlay: '#dce0e8',
    muted: '#8c8fa1',
    subtle: '#6c6f85',
    text: '#4c4f69',
    love: '#d20f39',
    gold: '#df8e1d',
    rose: '#ea76cb',
    pine: '#1e66f5',
    foam: '#04a5e5',
    iris: '#8839ef',
    'highlight-low': '#ccd0da',
    'highlight-med': '#bcc0cc',
    'highlight-high': '#acb0be',
  },
  'Tokyo Night': {
    base: '#1a1b26',
    surface: '#16161e',
    overlay: '#2f3549',
    muted: '#565f89',
    subtle: '#737aa2',
    text: '#c0caf5',
    love: '#f7768e',
    gold: '#e0af68',
    rose: '#ff9e64',
    pine: '#7aa2f7',
    foam: '#7dcfff',
    iris: '#bb9af7',
    'highlight-low': '#1a1b26',
    'highlight-med': '#2f3549',
    'highlight-high': '#3b4261',
  },
  'Gruvbox Dark': {
    base: '#282828',
    surface: '#1d2021',
    overlay: '#3c3836',
    muted: '#928374',
    subtle: '#a89984',
    text: '#ebdbb2',
    love: '#cc241d',
    gold: '#d79921',
    rose: '#b16286',
    pine: '#458588',
    foam: '#689d6a',
    iris: '#d3869b',
    'highlight-low': '#282828',
    'highlight-med': '#3c3836',
    'highlight-high': '#504945',
  },
  Nord: {
    base: '#2e3440',
    surface: '#3b4252',
    overlay: '#434c5e',
    muted: '#616e88',
    subtle: '#8898b4',
    text: '#eceff4',
    love: '#bf616a',
    gold: '#ebcb8b',
    rose: '#b48ead',
    pine: '#5e81ac',
    foam: '#88c0d0',
    iris: '#81a1c1',
    'highlight-low': '#2e3440',
    'highlight-med': '#434c5e',
    'highlight-high': '#4c566a',
  },
}

export const TOKEN_LABELS: Record<string, string> = {
  base: 'Base',
  surface: 'Surface',
  overlay: 'Overlay',
  muted: 'Muted',
  subtle: 'Subtle',
  text: 'Text',
  love: 'Love',
  gold: 'Gold',
  rose: 'Rose',
  pine: 'Pine',
  foam: 'Foam',
  iris: 'Iris',
  'highlight-low': 'Highlight Low',
  'highlight-med': 'Highlight Med',
  'highlight-high': 'Highlight High',
}

export const ACCENT_COLORS = [
  'var(--love)',
  'var(--gold)',
  'var(--rose)',
  'var(--pine)',
  'var(--foam)',
  'var(--iris)',
]

export const COLORS = ACCENT_COLORS

export function pickAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length]
}

const STORAGE_KEY = 'gitpeak-theme'
const CUSTOM_TOKENS_KEY = 'gitpeak-theme-tokens'

export function initTheme(): void {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem(STORAGE_KEY)
  if (!savedTheme) return

  if (savedTheme === 'custom') {
    const raw = localStorage.getItem(CUSTOM_TOKENS_KEY)
    if (raw) {
      try {
        const tokens = JSON.parse(raw)
        applyTokens(tokens)
      } catch (e) {
        console.error('Failed to parse saved theme tokens', e)
      }
    }
  } else {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
}

export function setTheme(themeName: string): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEY, themeName)
  localStorage.removeItem(CUSTOM_TOKENS_KEY)
  document.documentElement.setAttribute('data-theme', themeName)

  // Clear any inline styles that might be overriding the data-theme
  document.documentElement.removeAttribute('style')
}

export function saveCustomTokens(tokens: ThemeTokens): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEY, 'custom')
  localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(tokens))
  document.documentElement.removeAttribute('data-theme')
}

export function getTokens(): ThemeTokens {
  const tokens: ThemeTokens = {}
  for (const key of Object.keys(TOKEN_LABELS))
    tokens[key] = getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim()

  return tokens
}

export function applyTokens(tokens: ThemeTokens): void {
  for (const [key, value] of Object.entries(tokens))
    document.documentElement.style.setProperty(`--${key}`, value)
}

export function getSavedPresetName(): string | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem(STORAGE_KEY)
  return name === 'custom' ? null : name
}

export function previewPreset(themeName: string): void {
  if (typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', themeName)
  document.documentElement.removeAttribute('style')
}

export function applyPreset(themeName: string): void {
  setTheme(themeName)
  const tokens = PRESET_THEMES[themeName]
  if (tokens) applyTokens(tokens)
}

export function parseThemeFromCSS(cssText: string): ThemeTokens {
  const tokens: ThemeTokens = {}
  const matches = cssText.matchAll(/--([\w-]+):\s*([^;]+);/g)

  for (const match of matches) {
    const key = match[1].trim()
    if (TOKEN_LABELS[key]) tokens[key] = match[2].trim()
  }

  return tokens
}
