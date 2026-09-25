import { describe, expect, test } from 'bun:test'
import { layoutTopRepoHeader } from './top-repo-header'

const RIGHT_EDGE_X = 844

function repositoryNamed(
  name: string,
  stars: number,
): {
  name: string
  stars: number
  url: string
} {
  return { name, stars, url: `https://github.com/someone/${name}` }
}

function layoutTopRepoHeaderOrThrow(...args: Parameters<typeof layoutTopRepoHeader>) {
  const header = layoutTopRepoHeader(...args)
  if (!header) throw new Error('Expected layoutTopRepoHeader to return a header')
  return header
}

describe('layoutTopRepoHeader', () => {
  test('shows nothing for an account without repositories', () => {
    expect(layoutTopRepoHeader({ repository: null, rightEdgeX: RIGHT_EDGE_X })).toBeNull()
  })

  test('orders name, star, then count from left to right against the edge', () => {
    const header = layoutTopRepoHeaderOrThrow({
      repository: repositoryNamed('linux', 250_100),
      rightEdgeX: RIGHT_EDGE_X,
    })

    expect(header.countEndX).toBe(RIGHT_EDGE_X)
    expect(header.starGlyphEndX).toBeLessThan(header.countEndX)
    expect(header.nameEndX).toBeLessThan(header.starGlyphEndX)
    expect(header.leftEdgeX).toBeLessThan(header.nameEndX)
  })

  test('shortens a very long repository name with an ellipsis', () => {
    const header = layoutTopRepoHeaderOrThrow({
      repository: repositoryNamed('an-extremely-long-repository-name-for-testing', 2),
      rightEdgeX: RIGHT_EDGE_X,
    })

    expect(header.nameLabel.endsWith('…')).toBe(true)
  })

  test('reports how far left it reaches so the display name can stop short of it', () => {
    const shortHeader = layoutTopRepoHeaderOrThrow({
      repository: repositoryNamed('gp', 2),
      rightEdgeX: RIGHT_EDGE_X,
    })
    const longHeader = layoutTopRepoHeaderOrThrow({
      repository: repositoryNamed('ipynb-peek.nvim', 2),
      rightEdgeX: RIGHT_EDGE_X,
    })

    expect(longHeader.leftEdgeX).toBeLessThan(shortHeader.leftEdgeX)
  })
})
