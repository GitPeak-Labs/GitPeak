export interface TiltState {
  rotateX: number
  rotateY: number
  active: boolean
}

export function applyTilt(
  event: MouseEvent,
  element: HTMLElement,
  cachedRect?: DOMRect | null,
): TiltState {
  const boundaryRect = cachedRect ?? element.getBoundingClientRect()
  const positionX = event.clientX - boundaryRect.left
  const positionY = event.clientY - boundaryRect.top

  const midPointX = boundaryRect.width / 2
  const midPointY = boundaryRect.height / 2

  const tiltMultiplierX = 8
  const tiltMultiplierY = 8

  const rotateY = ((positionX - midPointX) / midPointX) * tiltMultiplierX
  const rotateX = ((midPointY - positionY) / midPointY) * tiltMultiplierY

  return { rotateX, rotateY, active: true }
}

export function neutralTilt(): TiltState {
  return { rotateX: 0, rotateY: 0, active: false }
}

export function tiltStyle(state: TiltState): string {
  if (!state.active) return 'transform: perspective(1000px) rotateX(0deg) rotateY(0deg)'

  return `transform: perspective(1000px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`
}

export function shineStyle(state: TiltState): string {
  if (!state.active) return 'opacity: 0'

  const angleRadians = Math.atan2(state.rotateX, state.rotateY)
  const angleDegrees = (angleRadians * 180) / Math.PI + 90

  return [
    `background: linear-gradient(${angleDegrees}deg, `,
    'rgba(255, 255, 255, 0.12) 0%, ',
    'transparent 80%); ',
    'opacity: 1;',
  ].join('')
}
