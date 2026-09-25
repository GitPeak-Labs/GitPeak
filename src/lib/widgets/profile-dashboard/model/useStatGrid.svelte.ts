import { SvelteMap } from 'svelte/reactivity'
import { neutralTilt, applyTilt, type TiltState } from '$lib/shared/lib/mouse-tilt'

const CARD_COUNT = 8

export type StatGridManager = {
  readonly tilts: TiltState[]
  onEnter: (pointerEvent: MouseEvent, index: number) => void
  onMove: (pointerEvent: MouseEvent, index: number) => void
  onLeave: (pointerEvent: MouseEvent, index: number) => void
}

export function useStatGrid(): StatGridManager {
  const tilts = $state<TiltState[]>(Array.from({ length: CARD_COUNT }, neutralTilt))
  const cachedRects = new SvelteMap<number, DOMRect>()
  let activeRafId: number | null = null

  return {
    get tilts() {
      return tilts
    },
    onEnter(pointerEvent: MouseEvent, index: number) {
      cachedRects.set(index, (pointerEvent.currentTarget as HTMLElement).getBoundingClientRect())
    },
    onMove(pointerEvent: MouseEvent, index: number) {
      const target = pointerEvent.currentTarget as HTMLElement
      const { clientX, clientY } = pointerEvent
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
    onLeave(_pointerEvent: MouseEvent, index: number) {
      if (activeRafId !== null) {
        cancelAnimationFrame(activeRafId)
        activeRafId = null
      }
      cachedRects.delete(index)
      tilts[index] = neutralTilt()
    },
  }
}
