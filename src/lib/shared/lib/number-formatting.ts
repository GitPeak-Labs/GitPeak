const THOUSAND = 1_000
const MILLION = 1_000_000
const TRAILING_ZERO_DECIMAL_PATTERN = /\.0$/
const fullNumberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

function compactWithSuffix(count: number, divisor: number, suffix: string): string {
  return `${(count / divisor).toFixed(1).replace(TRAILING_ZERO_DECIMAL_PATTERN, '')}${suffix}`
}

export function formatNumber(count: number): string {
  if (count < THOUSAND) return count.toString()
  if (count < MILLION) return compactWithSuffix(count, THOUSAND, 'k')
  return compactWithSuffix(count, MILLION, 'm')
}

export function formatFullNumber(count: number): string {
  return fullNumberFormatter.format(count)
}
