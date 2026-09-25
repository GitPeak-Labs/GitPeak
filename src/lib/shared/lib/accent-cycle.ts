export const ACCENT_COLORS = [
  'var(--love)',
  'var(--gold)',
  'var(--rose)',
  'var(--pine)',
  'var(--foam)',
  'var(--iris)',
]

export function pickAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length]
}
