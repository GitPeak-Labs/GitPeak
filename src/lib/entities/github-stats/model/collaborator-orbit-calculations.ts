import { pickAccentColor } from '$lib/shared/lib/accent-cycle'
import type { Collaborator } from './github-stats'

const ORBIT_RADIUS_INNER_PADDING = 10
const ORBIT_RADIUS_OUTER_PADDING = 12
const FULL_CIRCLE_DEGREES = 360
const ANGLE_START_OFFSET_DEGREES = 90
const DEGREES_TO_RADIANS_DIVISOR = 180
const CORE_SIZE_MIN_PIXELS = 2.5
const CORE_SIZE_MAX_PIXELS = 6
const CORE_SIZE_BASE_PIXELS = 2.5
const CORE_SIZE_SQRT_SCALE = 10

export type CollaboratorSortMode = 'commits' | 'frequency'

export type CollaboratorOrbitNode = {
  positionX: number
  positionY: number
  orbitRadius: number
  coreSizePixels: number
  haloSizePixels: number
  accentColor: string
} & Collaborator

export type CollaboratorOrbitLayout = {
  centerX: number
  centerY: number
  innerRadius: number
  outerRadius: number
}

type MetricRange = {
  logMinMetric: number
  logSpan: number
  totalMetric: number
}

type CollaboratorNodeContext = {
  layout: CollaboratorOrbitLayout
  collaboratorCount: number
  sortMode: CollaboratorSortMode
  metricRange: MetricRange
}

function isBotAccount(login: string): boolean {
  return login.endsWith('[bot]')
}

function getSortMetric(collaborator: Collaborator, sortMode: CollaboratorSortMode): number {
  return sortMode === 'commits' ? collaborator.commits : collaborator.sharedRepos
}

function sortCollaboratorsByMetric(
  collaborators: Collaborator[],
  sortMode: CollaboratorSortMode,
): Collaborator[] {
  return [...collaborators].sort(
    (firstCollaborator, secondCollaborator) =>
      getSortMetric(secondCollaborator, sortMode) - getSortMetric(firstCollaborator, sortMode),
  )
}

function computeMetricRange(metricValues: number[]): MetricRange {
  const logMaxMetric = Math.log(Math.max(...metricValues) + 1)
  const logMinMetric = Math.log(Math.min(...metricValues) + 1)
  const logSpan = logMaxMetric - logMinMetric || 1
  const totalMetric = metricValues.reduce((sum, metricValue) => sum + metricValue, 0) || 1

  return { logMinMetric, logSpan, totalMetric }
}

function computeOrbitRadius(
  layout: CollaboratorOrbitLayout,
  metric: number,
  metricRange: MetricRange,
): number {
  const { logMinMetric, logSpan } = metricRange
  const minOrbitRadius = layout.innerRadius + ORBIT_RADIUS_INNER_PADDING
  const maxOrbitRadius = layout.outerRadius + ORBIT_RADIUS_OUTER_PADDING
  const logMetric = Math.log(metric + 1)
  const collaborationStrength = (logMetric - logMinMetric) / logSpan

  return maxOrbitRadius - (maxOrbitRadius - minOrbitRadius) * collaborationStrength
}

function computeOrbitPosition(
  context: CollaboratorNodeContext,
  index: number,
  orbitRadius: number,
): { positionX: number; positionY: number } {
  const { layout, collaboratorCount } = context
  const angleDegrees =
    index * (FULL_CIRCLE_DEGREES / collaboratorCount) - ANGLE_START_OFFSET_DEGREES
  const angleRadians = (angleDegrees * Math.PI) / DEGREES_TO_RADIANS_DIVISOR

  return {
    positionX: layout.centerX + orbitRadius * Math.cos(angleRadians),
    positionY: layout.centerY + orbitRadius * Math.sin(angleRadians),
  }
}

function computeCoreSizePixels(
  metric: number,
  totalMetric: number,
): { coreSizePixels: number; haloSizePixels: number } {
  const metricShare = metric / totalMetric
  const coreSizePixels = Math.max(
    CORE_SIZE_MIN_PIXELS,
    Math.min(
      CORE_SIZE_MAX_PIXELS,
      CORE_SIZE_BASE_PIXELS + Math.sqrt(metricShare) * CORE_SIZE_SQRT_SCALE,
    ),
  )

  return { coreSizePixels, haloSizePixels: coreSizePixels * 2 }
}

function sortReposByCommits(repos: Collaborator['repos']): Collaborator['repos'] {
  return [...repos].sort((firstRepo, secondRepo) => secondRepo.commits - firstRepo.commits)
}

function buildCollaboratorNode(
  collaborator: Collaborator,
  index: number,
  context: CollaboratorNodeContext,
): CollaboratorOrbitNode {
  const { layout, sortMode, metricRange } = context
  const metric = getSortMetric(collaborator, sortMode)
  const orbitRadius = computeOrbitRadius(layout, metric, metricRange)
  const { positionX, positionY } = computeOrbitPosition(context, index, orbitRadius)
  const { coreSizePixels, haloSizePixels } = computeCoreSizePixels(metric, metricRange.totalMetric)
  const sortedRepos = sortReposByCommits(collaborator.repos)

  return {
    ...collaborator,
    repos: sortedRepos,
    positionX,
    positionY,
    orbitRadius,
    coreSizePixels,
    haloSizePixels,
    accentColor: pickAccentColor(index),
  }
}

export function calculateCollaboratorOrbitNodes(
  collaborators: Collaborator[],
  layout: CollaboratorOrbitLayout,
  sortMode: CollaboratorSortMode = 'commits',
): CollaboratorOrbitNode[] {
  const realCollaborators = collaborators.filter(
    (collaborator) => !isBotAccount(collaborator.login),
  )

  if (realCollaborators.length === 0) return []

  const sortedCollaborators = sortCollaboratorsByMetric(realCollaborators, sortMode)
  const collaboratorCount = sortedCollaborators.length
  const metricValues = sortedCollaborators.map((collaborator) =>
    getSortMetric(collaborator, sortMode),
  )
  const metricRange = computeMetricRange(metricValues)

  const context: CollaboratorNodeContext = { layout, collaboratorCount, sortMode, metricRange }

  return sortedCollaborators.map((collaborator, index) =>
    buildCollaboratorNode(collaborator, index, context),
  )
}
