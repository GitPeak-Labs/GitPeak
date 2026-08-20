import { polarToCoordinates } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'

const SWEEP_START_ANGLE_DEGREES = -90
const SWEEP_SPAN_DEGREES = 360
const FULL_CIRCLE_EPSILON_DEGREES = 0.01

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function sectorPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const spanDegrees = endAngle - startAngle

  if (spanDegrees >= SWEEP_SPAN_DEGREES - FULL_CIRCLE_EPSILON_DEGREES) {
    // A literal 360° single-arc path is a degenerate case in some renderers
    // (start/end coordinates coincide) — express the full circle as two
    // semicircular arcs instead.
    const left = round(centerX - radius)
    const right = round(centerX + radius)
    const cy = round(centerY)
    return (
      `M ${left} ${cy} A ${radius} ${radius} 0 1 1 ${right} ${cy} ` +
      `A ${radius} ${radius} 0 1 1 ${left} ${cy} Z`
    )
  }

  const largeArcFlag = spanDegrees > 180 ? 1 : 0
  const start = polarToCoordinates(centerX, centerY, radius, startAngle)
  const end = polarToCoordinates(centerX, centerY, radius, endAngle)

  return [
    `M ${round(centerX)} ${round(centerY)}`,
    `L ${round(start.positionX)} ${round(start.positionY)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${round(end.positionX)} ${round(end.positionY)}`,
    'Z',
  ].join(' ')
}

export interface SweepRevealMask {
  baseD: string
  values: string
  keyTimes: string
  durSeconds: number
}

// Precomputed discrete SMIL keyframes that reproduce the live dashboard's
// requestAnimationFrame sweep (-90deg -> 270deg, ease-out-cubic, 1200ms) as a
// static, declarative <animate> — needed because the README/OG SVG can't run JS.
export function buildSweepRevealMask(
  centerX: number,
  centerY: number,
  radius: number,
  sampleCount = 48,
  durSeconds = 1.2,
): SweepRevealMask {
  const steps = Math.max(sampleCount, 2)
  const dValues: string[] = []
  const keyTimeValues: string[] = []

  for (let index = 0; index < steps; index += 1) {
    const linearProgress = index / (steps - 1)
    const easedProgress = easeOutCubic(linearProgress)
    const endAngle = SWEEP_START_ANGLE_DEGREES + easedProgress * SWEEP_SPAN_DEGREES
    dValues.push(sectorPath(centerX, centerY, radius, SWEEP_START_ANGLE_DEGREES, endAngle))
    keyTimeValues.push(linearProgress.toFixed(4))
  }

  return {
    baseD: dValues[dValues.length - 1],
    values: dValues.join(';'),
    keyTimes: keyTimeValues.join(';'),
    durSeconds,
  }
}
