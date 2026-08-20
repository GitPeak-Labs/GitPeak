import { pickAccentColor } from '$lib/theme/theme-manager'
import type { Collaborator } from './github-stats'

export type CollaboratorSortMode = 'commits' | 'frequency'

export interface CollaboratorOrbitNode extends Collaborator {
  positionX: number
  positionY: number
  orbitRadius: number
  coreSizePixels: number
  haloSizePixels: number
  accentColor: string
}

// GitHub Actions / Dependabot etc. can show up as "collaborators" in raw commit data but
// aren't people — keep them out of the orbit.
function isBotAccount(login: string): boolean {
  return login.endsWith('[bot]')
}

function getSortMetric(collaborator: Collaborator, sortMode: CollaboratorSortMode): number {
  return sortMode === 'commits' ? collaborator.commits : collaborator.sharedRepos
}

export function calculateCollaboratorOrbitNodes(
  collaborators: Collaborator[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  sortMode: CollaboratorSortMode = 'commits',
): CollaboratorOrbitNode[] {
  const realCollaborators = collaborators.filter(
    (collaborator) => !isBotAccount(collaborator.login),
  )
  if (realCollaborators.length === 0) return []

  const sortedCollaborators = [...realCollaborators].sort(
    (a, b) => getSortMetric(b, sortMode) - getSortMetric(a, sortMode),
  )
  const collaboratorCount = sortedCollaborators.length

  const metricValues = sortedCollaborators.map((collaborator) =>
    getSortMetric(collaborator, sortMode),
  )
  const logMaxMetric = Math.log(Math.max(...metricValues) + 1)
  const logMinMetric = Math.log(Math.min(...metricValues) + 1)
  const logSpan = logMaxMetric - logMinMetric || 1

  const minOrbitRadius = innerRadius + 10
  const maxOrbitRadius = outerRadius + 12

  const totalMetric = metricValues.reduce((sum, value) => sum + value, 0) || 1

  return sortedCollaborators.map((collaborator, index) => {
    const metric = getSortMetric(collaborator, sortMode)
    const logMetric = Math.log(metric + 1)
    const collaborationStrength = (logMetric - logMinMetric) / logSpan
    const orbitRadius = maxOrbitRadius - (maxOrbitRadius - minOrbitRadius) * collaborationStrength

    const angleDegrees = index * (360 / collaboratorCount) - 90
    const angleRadians = (angleDegrees * Math.PI) / 180

    const positionX = centerX + orbitRadius * Math.cos(angleRadians)
    const positionY = centerY + orbitRadius * Math.sin(angleRadians)

    const metricShare = metric / totalMetric
    const coreSizePixels = Math.max(2.5, Math.min(6, 2.5 + Math.sqrt(metricShare) * 10))
    const haloSizePixels = coreSizePixels * 2
    const sortedRepos = [...collaborator.repos].sort((a, b) => b.commits - a.commits)

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
  })
}
