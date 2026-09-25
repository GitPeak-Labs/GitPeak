const MONO_ADVANCE_EM = 0.6

export function monoNameBudget(rowWidth: number, fontSize: number, percentage: number): number {
  return Math.floor(rowWidth / (fontSize * MONO_ADVANCE_EM)) - `${percentage}%`.length - 1
}

export type FitLegendNameOptions = {
  name: string
  percentage: number
  rowWidth: number
  fontSize: number
}

export function fitLegendName({
  name,
  percentage,
  rowWidth,
  fontSize,
}: FitLegendNameOptions): string {
  const maxNameChars = monoNameBudget(rowWidth, fontSize, percentage)

  if (name.length <= maxNameChars) return name

  return `${name.slice(0, Math.max(1, maxNameChars - 1))}…`
}

function splitLegendLine(rest: string, budget: number): { line: string; rest: string } {
  const window = rest.slice(0, budget + 1)
  const breakAt = Math.max(window.lastIndexOf(' '), window.lastIndexOf('-'))

  if (breakAt <= 0) {
    return { line: rest.slice(0, budget), rest: rest.slice(budget) }
  }

  return {
    line: rest.slice(0, rest[breakAt] === '-' ? breakAt + 1 : breakAt),
    rest: rest.slice(breakAt + 1),
  }
}

function wrapNameRemainder(rest: string, budget: number, maxLines: number): string[] {
  if (rest.length <= budget || maxLines <= 1) {
    return [rest.length > budget ? `${rest.slice(0, Math.max(1, budget - 1))}…` : rest]
  }

  const { line, rest: remaining } = splitLegendLine(rest, budget)
  return [line, ...wrapNameRemainder(remaining, budget, maxLines - 1)]
}

export function wrapName(name: string, maxChars: number, maxLines = 2): string[] {
  const budget = Math.max(1, maxChars)
  return wrapNameRemainder(name.trim(), budget, maxLines)
}
