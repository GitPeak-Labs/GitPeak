export function startOffsets(extents: number[]): number[] {
  return extents.reduce<number[]>(
    (offsets, _, index) => [...offsets, index === 0 ? 0 : offsets[index - 1] + extents[index - 1]],
    [],
  )
}
