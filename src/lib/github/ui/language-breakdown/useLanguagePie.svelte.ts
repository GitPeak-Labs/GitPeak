import { Tween } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'
import type { GitHubLanguage } from '$lib/github/models/github-stats'
import { pickAccentColor } from '$lib/theme/theme-manager'

export type PieSlice = GitHubLanguage & {
  color: string
  startAngleDegrees: number
  endAngleDegrees: number
  midAngleDegrees: number
}

const GAP_DEGREES = 1.8
const PUSH_PIXELS = 7

export function getDimensions(isMobileDevice: boolean) {
  const sizePixels = isMobileDevice ? 160 : 200
  const outerRadiusPixels = isMobileDevice ? 75 : 90
  const innerRadiusPixels = isMobileDevice ? 48 : 57

  return {
    sizePixels,
    centerX: sizePixels / 2,
    centerY: sizePixels / 2,
    outerRadiusPixels,
    innerRadiusPixels,
  }
}

export function polarToCoordinates(
  centerX: number,
  centerY: number,
  radius: number,
  degrees: number,
) {
  const radians = (degrees * Math.PI) / 180

  return {
    positionX: centerX + radius * Math.cos(radians),
    positionY: centerY + radius * Math.sin(radians),
  }
}

export function generateArcPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
  offsetX = 0,
  offsetY = 0,
): string {
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  const outerStart = polarToCoordinates(centerX, centerY, outerRadius, startAngle)
  const outerEnd = polarToCoordinates(centerX, centerY, outerRadius, endAngle)
  const innerStart = polarToCoordinates(centerX, centerY, innerRadius, endAngle)
  const innerEnd = polarToCoordinates(centerX, centerY, innerRadius, startAngle)

  return [
    `M ${outerStart.positionX + offsetX} ${outerStart.positionY + offsetY}`,
    `A ${outerRadius} ${outerRadius} 
    0 ${largeArcFlag} 1 ${outerEnd.positionX + offsetX} ${outerEnd.positionY + offsetY}`,
    `L ${innerStart.positionX + offsetX} ${innerStart.positionY + offsetY}`,
    `A ${innerRadius} ${innerRadius} 
    0 ${largeArcFlag} 0 ${innerEnd.positionX + offsetX} ${innerEnd.positionY + offsetY}`,
    'Z',
  ].join(' ')
}

export function calculateSegmentOffset(slice: PieSlice): { offsetX: number; offsetY: number } {
  const radians = (slice.midAngleDegrees * Math.PI) / 180

  return {
    offsetX: Math.cos(radians) * PUSH_PIXELS,
    offsetY: Math.sin(radians) * PUSH_PIXELS,
  }
}

export function buildPieSlices(languages: GitHubLanguage[]): PieSlice[] {
  if (!languages?.length) return []

  let cursorDegrees = -90

  return languages.map((language, index) => {
    const spanDegrees = (language.percentage / 100) * 360
    const startAngleDegrees = cursorDegrees + GAP_DEGREES / 2
    const endAngleDegrees = cursorDegrees + spanDegrees - GAP_DEGREES / 2
    const midAngleDegrees = cursorDegrees + spanDegrees / 2

    cursorDegrees += spanDegrees

    return {
      ...language,
      color: pickAccentColor(index),
      startAngleDegrees,
      endAngleDegrees,
      midAngleDegrees,
    }
  })
}

export function useLanguagePie(getLanguages: () => GitHubLanguage[]) {
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 640
  const dimensions = getDimensions(isMobileDevice)

  let hoveredIndex = $state<number | null>(null)
  const sweepDegrees = new Tween(-90, { duration: 1200, easing: cubicOut })
  sweepDegrees.target = 270
  const slices = $derived(buildPieSlices(getLanguages()))

  const animatedSlices = $derived(
    slices
      .filter((slice) => sweepDegrees.current > slice.startAngleDegrees)
      .map((slice) => ({
        ...slice,
        endAngleDegrees: Math.min(slice.endAngleDegrees, sweepDegrees.current),
      })),
  )

  return {
    dimensions,
    get hoveredIndex() {
      return hoveredIndex
    },
    get slices() {
      return slices
    },
    get animatedSlices() {
      return animatedSlices
    },
    onEnter(index: number) {
      hoveredIndex = index
    },
    onLeave() {
      hoveredIndex = null
    },
  }
}
