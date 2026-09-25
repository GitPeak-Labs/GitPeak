import { pickAccentColor } from './accent-cycle'
import { startOffsets } from './start-offsets'

export type ProportionDatum = {
  name: string
  percentage: number
}

export type PieSlice = ProportionDatum & {
  color: string
  startAngleDegrees: number
  endAngleDegrees: number
  midAngleDegrees: number
}

type PieDimensions = {
  sizePixels: number
  centerX: number
  centerY: number
  outerRadiusPixels: number
  innerRadiusPixels: number
}

type PolarPoint = {
  centerX: number
  centerY: number
  radius: number
  degrees: number
}

type CartesianPoint = {
  positionX: number
  positionY: number
}

type ArcSegment = {
  centerX: number
  centerY: number
  outerRadius: number
  innerRadius: number
  startAngle: number
  endAngle: number
  offsetX?: number
  offsetY?: number
}

const GAP_DEGREES = 1.8
const PUSH_PIXELS = 7
const HALF_TURN_DEGREES = 180
const FULL_TURN_DEGREES = 360
const TWELVE_O_CLOCK_DEGREES = -90
const PERCENT_SCALE = 100

const MOBILE_SIZES = { sizePixels: 160, outerRadiusPixels: 75, innerRadiusPixels: 48 }
const DESKTOP_SIZES = { sizePixels: 200, outerRadiusPixels: 90, innerRadiusPixels: 57 }

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / HALF_TURN_DEGREES
}

export function getDimensions(isMobileDevice: boolean): PieDimensions {
  const sizes = isMobileDevice ? MOBILE_SIZES : DESKTOP_SIZES
  return { ...sizes, centerX: sizes.sizePixels / 2, centerY: sizes.sizePixels / 2 }
}

export function polarToCoordinates({
  centerX,
  centerY,
  radius,
  degrees,
}: PolarPoint): CartesianPoint {
  const radians = toRadians(degrees)
  return {
    positionX: centerX + radius * Math.cos(radians),
    positionY: centerY + radius * Math.sin(radians),
  }
}

export function generateArcPath(segment: ArcSegment): string {
  const { centerX, centerY, outerRadius, innerRadius, startAngle, endAngle } = segment
  const offsetX = segment.offsetX ?? 0
  const offsetY = segment.offsetY ?? 0
  const largeArcFlag = endAngle - startAngle > HALF_TURN_DEGREES ? 1 : 0
  const pointAt = (radius: number, degrees: number): string => {
    const point = polarToCoordinates({ centerX, centerY, radius, degrees })
    return `${point.positionX + offsetX} ${point.positionY + offsetY}`
  }

  return [
    `M ${pointAt(outerRadius, startAngle)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${pointAt(outerRadius, endAngle)}`,
    `L ${pointAt(innerRadius, endAngle)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${pointAt(innerRadius, startAngle)}`,
    'Z',
  ].join(' ')
}

export function calculateSegmentOffset(slice: PieSlice): { offsetX: number; offsetY: number } {
  const radians = toRadians(slice.midAngleDegrees)
  return {
    offsetX: Math.cos(radians) * PUSH_PIXELS,
    offsetY: Math.sin(radians) * PUSH_PIXELS,
  }
}

export function buildPieSlices(proportions: ProportionDatum[]): PieSlice[] {
  const spansDegrees = proportions.map(
    (proportion) => (proportion.percentage / PERCENT_SCALE) * FULL_TURN_DEGREES,
  )
  const sliceStartsDegrees = startOffsets(spansDegrees).map(
    (offset) => TWELVE_O_CLOCK_DEGREES + offset,
  )

  return proportions.map((proportion, index) => {
    const sliceStart = sliceStartsDegrees[index]
    const spanDegrees = spansDegrees[index]
    return {
      name: proportion.name,
      percentage: proportion.percentage,
      color: pickAccentColor(index),
      startAngleDegrees: sliceStart + GAP_DEGREES / 2,
      endAngleDegrees: sliceStart + spanDegrees - GAP_DEGREES / 2,
      midAngleDegrees: sliceStart + spanDegrees / 2,
    }
  })
}
