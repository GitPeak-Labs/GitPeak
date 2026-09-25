import { Tween } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'
import {
  Globe,
  User,
  Users,
  GitCommitHorizontal,
  Repeat2,
  Palette,
  Orbit,
  Handshake,
} from 'lucide-svelte'
import type { GitHubLanguage } from '$lib/entities/github-stats/model/github-stats'
import { buildPieSlices, getDimensions, type PieSlice } from '$lib/shared/lib/pie-geometry'

const MOBILE_BREAKPOINT_PIXELS = 640
const SWEEP_START_DEGREES = -90
const SWEEP_END_DEGREES = 270
const SWEEP_DURATION_MILLISECONDS = 1200

export type OwnershipFilter = 'all' | 'owned' | 'others'
export type ViewMode = 'languages' | 'orbit' | 'collaborators'
export type CollaboratorSortMode = 'commits' | 'frequency'

export type ToggleOption = {
  Icon: unknown
  isActive: boolean
  onToggle: () => void
  tooltipLabel: string
}

export type ToggleSpec<T extends string> = readonly [
  icon: unknown,
  specValue: T,
  tooltipLabel: string,
]

export function buildToggleOptions<T extends string>(
  specs: readonly ToggleSpec<T>[],
  activeValue: T,
  onSelect: (specValue: T) => void,
): ToggleOption[] {
  return specs.map(([Icon, specValue, tooltipLabel]) => ({
    Icon,
    isActive: activeValue === specValue,
    onToggle: onSelect.bind(null, specValue),
    tooltipLabel,
  }))
}

export type TabSpec = { tabValue: ViewMode; Icon: unknown; label: string }

export const OWNERSHIP_TOGGLE_SPECS: readonly ToggleSpec<OwnershipFilter>[] = [
  [Globe, 'all', 'All Repos'],
  [User, 'owned', 'My Repos'],
  [Users, 'others', 'Contributions'],
]

export const COLLABORATOR_SORT_SPECS: readonly ToggleSpec<CollaboratorSortMode>[] = [
  [GitCommitHorizontal, 'commits', 'Sort by Commits'],
  [Repeat2, 'frequency', 'Sort by Collab Frequency'],
]

export const ALL_TAB_SPECS: readonly TabSpec[] = [
  { tabValue: 'languages', Icon: Palette, label: 'Lang' },
  { tabValue: 'orbit', Icon: Orbit, label: 'Orbit' },
  { tabValue: 'collaborators', Icon: Handshake, label: 'Collab' },
]

function createSweepTween(): Tween<number> {
  const sweepDegrees = new Tween(SWEEP_START_DEGREES, {
    duration: SWEEP_DURATION_MILLISECONDS,
    easing: cubicOut,
  })
  sweepDegrees.target = SWEEP_END_DEGREES
  return sweepDegrees
}

function revealSlicesUpTo(slices: PieSlice[], sweepDegreesValue: number): PieSlice[] {
  return slices
    .filter((slice) => sweepDegreesValue > slice.startAngleDegrees)
    .map((slice) => ({
      ...slice,
      endAngleDegrees: Math.min(slice.endAngleDegrees, sweepDegreesValue),
    }))
}

export function useLanguagePie(getLanguages: () => GitHubLanguage[]): {
  dimensions: ReturnType<typeof getDimensions>
  readonly hoveredIndex: number | null
  readonly slices: PieSlice[]
  readonly animatedSlices: PieSlice[]
  onEnter: (index: number) => void
  onLeave: () => void
} {
  const isMobileDevice =
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PIXELS
  const dimensions = getDimensions(isMobileDevice)

  let hoveredIndex = $state<number | null>(null)
  const sweepDegrees = createSweepTween()
  const slices = $derived(buildPieSlices(getLanguages()))
  const animatedSlices = $derived(revealSlicesUpTo(slices, sweepDegrees.current))

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
