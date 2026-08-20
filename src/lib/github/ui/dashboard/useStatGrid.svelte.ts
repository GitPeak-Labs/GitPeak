import { SvelteMap } from 'svelte/reactivity'
import type { GithubStats } from '$lib/github/models/github-stats'
import { neutralTilt, applyTilt, type TiltState } from '$lib/ui/interactions/mouse-tilt'
import {
  Star,
  Users,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  BookOpen,
  Activity,
} from 'lucide-svelte'

export type StatItem = {
  label: string
  value: number
  icon: unknown
  accentVar: string
}

export function heroItems(s: GithubStats): StatItem[] {
  return [
    { label: 'Contributions', value: s.totalContributions, icon: Activity, accentVar: 'foam' },
    { label: 'Commits', value: s.totalCommits, icon: GitCommitHorizontal, accentVar: 'iris' },
  ]
}

export function detailItems(s: GithubStats): StatItem[] {
  return [
    { label: 'Stars', value: s.totalStars, icon: Star, accentVar: 'gold' },
    { label: 'Repos', value: s.totalRepos, icon: BookOpen, accentVar: 'iris' },
    { label: 'Followers', value: s.followers, icon: Users, accentVar: 'rose' },
    { label: 'PRs', value: s.totalPrs, icon: GitPullRequest, accentVar: 'love' },
    { label: 'Issues', value: s.totalIssues, icon: CircleDot, accentVar: 'gold' },
  ]
}

const CARD_COUNT = 8

export function useStatGrid() {
  const tilts = $state<TiltState[]>(Array.from({ length: CARD_COUNT }, neutralTilt))
  const cachedRects = new SvelteMap<number, DOMRect>()
  let activeRafId: number | null = null

  return {
    get tilts() {
      return tilts
    },
    onEnter(e: MouseEvent, index: number) {
      cachedRects.set(index, (e.currentTarget as HTMLElement).getBoundingClientRect())
    },
    onMove(e: MouseEvent, index: number) {
      const target = e.currentTarget as HTMLElement
      const clientX = e.clientX
      const clientY = e.clientY
      if (activeRafId !== null) return

      activeRafId = requestAnimationFrame(() => {
        activeRafId = null
        let rect = cachedRects.get(index)
        if (!rect) {
          rect = target.getBoundingClientRect()
          cachedRects.set(index, rect)
        }
        tilts[index] = applyTilt({ clientX, clientY } as MouseEvent, target, rect)
      })
    },
    onLeave(_e: MouseEvent, index: number) {
      if (activeRafId !== null) {
        cancelAnimationFrame(activeRafId)
        activeRafId = null
      }
      cachedRects.delete(index)
      tilts[index] = neutralTilt()
    },
  }
}
