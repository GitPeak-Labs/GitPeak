import type { MostStarredRepo } from '$lib/entities/github-stats/model/github-stats'
import { formatFullNumber } from '$lib/shared/lib/number-formatting'
import { fitDisplayName, serifTextWidth } from './display-name'

export const REPO_NAME_FONT_SIZE = 26
export const REPO_STARS_FONT_SIZE = 26
export const STAR_GLYPH_FONT_SIZE = 18

const MAX_REPO_NAME_WIDTH = 280
const STAR_GLYPH_WIDTH = 16
const STAR_TO_COUNT_GAP = 4
const NAME_TO_STARS_GAP = 14

type TopRepoInput = {
  repository: MostStarredRepo | null
  rightEdgeX: number
}

type TopRepoHeader = {
  nameLabel: string
  starCount: number
  nameEndX: number
  starGlyphEndX: number
  countEndX: number
  leftEdgeX: number
}

export function layoutTopRepoHeader({
  repository,
  rightEdgeX,
}: TopRepoInput): TopRepoHeader | null {
  if (!repository) return null

  const countWidth = serifTextWidth(formatFullNumber(repository.stars), REPO_STARS_FONT_SIZE)
  const starGlyphEndX = rightEdgeX - countWidth - STAR_TO_COUNT_GAP
  const nameEndX = starGlyphEndX - STAR_GLYPH_WIDTH - NAME_TO_STARS_GAP
  const nameLabel = fitDisplayName(repository.name, MAX_REPO_NAME_WIDTH / REPO_NAME_FONT_SIZE)
  const nameWidth = serifTextWidth(nameLabel, REPO_NAME_FONT_SIZE)

  return {
    nameLabel,
    starCount: repository.stars,
    nameEndX,
    starGlyphEndX,
    countEndX: rightEdgeX,
    leftEdgeX: nameEndX - nameWidth,
  }
}
