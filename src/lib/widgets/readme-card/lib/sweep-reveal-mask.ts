import { cubicOut } from 'svelte/easing'
import { polarToCoordinates } from '$lib/shared/lib/pie-geometry'

const SWEEP_START_ANGLE_DEGREES = -90
const FULL_TURN_DEGREES = 360
const HALF_TURN_DEGREES = 180
const FULL_CIRCLE_EPSILON_DEGREES = 0.01
const KEYFRAME_SAMPLE_COUNT = 48
const SWEEP_DURATION_SECONDS = 1.2
const COORDINATE_PRECISION = 100
const KEY_TIME_DECIMALS = 4

export const SWEEP_BEGIN_SECONDS = 0.35

type Circle = {
  centerX: number
  centerY: number
  radius: number
}

type Sector = Circle & {
  endAngleDegrees: number
}

type SweepRevealMask = {
  finalPath: string
  pathKeyframes: string
  keyTimes: string
  durationSeconds: number
}

function inverseEaseOutCubic(easedProgress: number): number {
  return 1 - Math.cbrt(1 - easedProgress)
}

function roundCoordinate(coordinate: number): number {
  return Math.round(coordinate * COORDINATE_PRECISION) / COORDINATE_PRECISION
}

function fullCirclePath({ centerX, centerY, radius }: Circle): string {
  const leftX = roundCoordinate(centerX - radius)
  const rightX = roundCoordinate(centerX + radius)
  const middleY = roundCoordinate(centerY)
  const halfArc = `A ${radius} ${radius} 0 1 1`

  return `M ${leftX} ${middleY} ${halfArc} ${rightX} ${middleY} ${halfArc} ${leftX} ${middleY} Z`
}

function sectorPath(sector: Sector): string {
  const { centerX, centerY, radius, endAngleDegrees } = sector
  const spanDegrees = endAngleDegrees - SWEEP_START_ANGLE_DEGREES
  const isFullCircle = spanDegrees >= FULL_TURN_DEGREES - FULL_CIRCLE_EPSILON_DEGREES
  if (isFullCircle) return fullCirclePath(sector)

  const largeArcFlag = spanDegrees > HALF_TURN_DEGREES ? 1 : 0
  const start = polarToCoordinates({
    centerX,
    centerY,
    radius,
    degrees: SWEEP_START_ANGLE_DEGREES,
  })
  const end = polarToCoordinates({ centerX, centerY, radius, degrees: endAngleDegrees })

  return [
    `M ${roundCoordinate(centerX)} ${roundCoordinate(centerY)}`,
    `L ${roundCoordinate(start.positionX)} ${roundCoordinate(start.positionY)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1`,
    `${roundCoordinate(end.positionX)} ${roundCoordinate(end.positionY)}`,
    'Z',
  ].join(' ')
}

export function buildSweepRevealMask(circle: Circle): SweepRevealMask {
  const linearProgressSteps = Array.from(
    { length: KEYFRAME_SAMPLE_COUNT },
    (_, stepIndex) => stepIndex / (KEYFRAME_SAMPLE_COUNT - 1),
  )
  const sectorPaths = linearProgressSteps.map((linearProgress) =>
    sectorPath({
      ...circle,
      endAngleDegrees: SWEEP_START_ANGLE_DEGREES + cubicOut(linearProgress) * FULL_TURN_DEGREES,
    }),
  )

  return {
    finalPath: sectorPaths.at(-1) ?? '',
    pathKeyframes: sectorPaths.join(';'),
    keyTimes: linearProgressSteps.map((step) => step.toFixed(KEY_TIME_DECIMALS)).join(';'),
    durationSeconds: SWEEP_DURATION_SECONDS,
  }
}

export function sweepRevealDelaySeconds(startAngleDegrees: number): number {
  const sweptFraction = (startAngleDegrees - SWEEP_START_ANGLE_DEGREES) / FULL_TURN_DEGREES
  const clampedFraction = Math.min(Math.max(sweptFraction, 0), 1)

  return SWEEP_BEGIN_SECONDS + inverseEaseOutCubic(clampedFraction) * SWEEP_DURATION_SECONDS
}
