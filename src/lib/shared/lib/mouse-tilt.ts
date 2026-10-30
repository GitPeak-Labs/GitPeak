export type TiltState = {
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

const TILT_X_VARIABLE = '--tilt-x'
const TILT_Y_VARIABLE = '--tilt-y'
const SHINE_ROTATION_VARIABLE = '--shine-rotation'

export const TILT_TRANSFORM_STYLE = [
  'transform: perspective(1000px)',
  `rotateX(var(${TILT_X_VARIABLE}, 0deg))`,
  `rotateY(var(${TILT_Y_VARIABLE}, 0deg))`,
].join(' ')

const HALF_TURN_DEGREES = 180
const QUARTER_TURN_DEGREES = 90

function shineRotationDegrees(state: TiltState): number {
  const angleRadians = Math.atan2(state.rotateX, state.rotateY)
  const gradientAngle = (angleRadians * HALF_TURN_DEGREES) / Math.PI + QUARTER_TURN_DEGREES

  return gradientAngle - HALF_TURN_DEGREES
}

function findShineBeam(element: HTMLElement): HTMLElement | null {
  return element.querySelector<HTMLElement>('.tilt-shine-beam')
}

export function writeTiltVariables(element: HTMLElement, state: TiltState): void {
  element.style.setProperty(TILT_X_VARIABLE, `${state.rotateX}deg`)
  element.style.setProperty(TILT_Y_VARIABLE, `${state.rotateY}deg`)
  findShineBeam(element)?.style.setProperty(
    SHINE_ROTATION_VARIABLE,
    `${shineRotationDegrees(state)}deg`,
  )
}

export function clearTiltVariables(element: HTMLElement): void {
  element.style.removeProperty(TILT_X_VARIABLE)
  element.style.removeProperty(TILT_Y_VARIABLE)
  findShineBeam(element)?.style.removeProperty(SHINE_ROTATION_VARIABLE)
}
