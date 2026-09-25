import { pickAccentColor } from '$lib/shared/lib/accent-cycle'
import type { InvolvedRepo, GitHubLanguage } from './github-stats'

const HASH_SHIFT_BITS = 5
const ORBIT_RADIUS_INNER_PADDING = 10
const ORBIT_RADIUS_OUTER_PADDING = 12
const CORE_SIZE_MIN_PIXELS = 1.8
const CORE_SIZE_MAX_PIXELS = 3.5
const CORE_SIZE_DIVISOR = 24
const FULL_CIRCLE_DEGREES = 360
const ANGLE_START_OFFSET_DEGREES = 90
const DEGREES_TO_RADIANS_DIVISOR = 180
const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY

export type OrbitNode = {
  positionX: number
  positionY: number
  orbitRadius: number
  relativeTimeLabel: string
  coreSizePixels: number
  haloSizePixels: number
  languageColor: string
} & InvolvedRepo

export type OrbitLayout = {
  centerX: number
  centerY: number
  innerRadius: number
  outerRadius: number
}

type ParsedRepo = InvolvedRepo & { timestampMs: number }

type OrbitNodeContext = {
  layout: OrbitLayout
  oldestTimestampMs: number
  timeSpanMs: number
  repositoryCount: number
  coreSizePixels: number
  haloSizePixels: number
  currentTimeMs: number
  allLanguages: GitHubLanguage[]
}

function computeStringHash(text: string): number {
  return text
    .split('')
    .reduce((hash, character) => character.charCodeAt(0) + ((hash << HASH_SHIFT_BITS) - hash), 0)
}

function getLanguageColor(
  languageName: string | null | undefined,
  allLanguages: GitHubLanguage[],
): string {
  if (!languageName) return 'var(--iris)'

  const languageIndex = allLanguages.findIndex(
    (language) => language.name.toLowerCase() === languageName.toLowerCase(),
  )

  if (languageIndex !== -1) return pickAccentColor(languageIndex)

  return pickAccentColor(Math.abs(computeStringHash(languageName)))
}

function formatRelativeTimeLabel(ageInDays: number): string {
  if (ageInDays === 0) return 'today'
  if (ageInDays === 1) return 'yesterday'

  return `${ageInDays}d ago`
}

function sortRepositoriesByRecency(repositories: InvolvedRepo[]): ParsedRepo[] {
  return repositories
    .map((repository) => ({
      ...repository,
      timestampMs: Date.parse(repository.lastContributedAt),
    }))
    .sort(
      (firstRepository, secondRepository) =>
        secondRepository.timestampMs - firstRepository.timestampMs,
    )
}

function computeCoreSizePixels(repositoryCount: number): {
  coreSizePixels: number
  haloSizePixels: number
} {
  const coreSizePixels = Math.max(
    CORE_SIZE_MIN_PIXELS,
    Math.min(CORE_SIZE_MAX_PIXELS, CORE_SIZE_DIVISOR / repositoryCount),
  )

  return { coreSizePixels, haloSizePixels: coreSizePixels * 2 }
}

function buildOrbitNode(
  repository: ParsedRepo,
  index: number,
  context: OrbitNodeContext,
): OrbitNode {
  const {
    layout,
    oldestTimestampMs,
    timeSpanMs,
    repositoryCount,
    coreSizePixels,
    haloSizePixels,
    currentTimeMs,
    allLanguages,
  } = context

  const minOrbitRadius = layout.innerRadius + ORBIT_RADIUS_INNER_PADDING
  const maxOrbitRadius = layout.outerRadius + ORBIT_RADIUS_OUTER_PADDING

  const timeProgress = (repository.timestampMs - oldestTimestampMs) / timeSpanMs
  const orbitRadius = maxOrbitRadius - (maxOrbitRadius - minOrbitRadius) * timeProgress

  const angleDegrees = index * (FULL_CIRCLE_DEGREES / repositoryCount) - ANGLE_START_OFFSET_DEGREES
  const angleRadians = (angleDegrees * Math.PI) / DEGREES_TO_RADIANS_DIVISOR

  const positionX = layout.centerX + orbitRadius * Math.cos(angleRadians)
  const positionY = layout.centerY + orbitRadius * Math.sin(angleRadians)

  const ageInDays = Math.max(0, Math.floor((currentTimeMs - repository.timestampMs) / MS_PER_DAY))

  return {
    ...repository,
    positionX,
    positionY,
    orbitRadius,
    relativeTimeLabel: formatRelativeTimeLabel(ageInDays),
    coreSizePixels,
    haloSizePixels,
    languageColor: getLanguageColor(repository.primaryLanguage, allLanguages),
  }
}

export function calculateOrbitNodes(
  repositories: InvolvedRepo[],
  allLanguages: GitHubLanguage[],
  layout: OrbitLayout,
): OrbitNode[] {
  if (repositories.length === 0) return []

  const parsedRepositories = sortRepositoriesByRecency(repositories)

  const timestamps = parsedRepositories.map((repository) => repository.timestampMs)
  const newestTimestampMs = Math.max(...timestamps)
  const oldestTimestampMs = Math.min(...timestamps)
  const timeSpanMs = newestTimestampMs - oldestTimestampMs || 1
  const repositoryCount = parsedRepositories.length

  const { coreSizePixels, haloSizePixels } = computeCoreSizePixels(repositoryCount)

  const context: OrbitNodeContext = {
    layout,
    oldestTimestampMs,
    timeSpanMs,
    repositoryCount,
    coreSizePixels,
    haloSizePixels,
    currentTimeMs: Date.now(),
    allLanguages,
  }

  return parsedRepositories.map((repository, index) => buildOrbitNode(repository, index, context))
}
