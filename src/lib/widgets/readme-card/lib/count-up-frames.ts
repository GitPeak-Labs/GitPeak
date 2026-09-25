import { cubicOut } from 'svelte/easing'
import { formatFullNumber } from '$lib/shared/lib/number-formatting'

const FRAME_COUNT = 16
const COUNT_UP_DURATION_SECONDS = 1.1
const SECONDS_PRECISION = 1000

type CountUpFrame = {
  label: string
  showFromSeconds: number
  hideAtSeconds: number | null
}

type CountUpInput = {
  finalCount: number
  beginSeconds: number
}

function roundSeconds(seconds: number): number {
  return Math.round(seconds * SECONDS_PRECISION) / SECONDS_PRECISION
}

export function buildCountUpFrames({ finalCount, beginSeconds }: CountUpInput): CountUpFrame[] {
  const secondsPerFrame = COUNT_UP_DURATION_SECONDS / (FRAME_COUNT - 1)
  const rawFrames = Array.from({ length: FRAME_COUNT }, (_, frameIndex) => ({
    label: formatFullNumber(Math.round(finalCount * cubicOut(frameIndex / (FRAME_COUNT - 1)))),
    showFromSeconds: roundSeconds(beginSeconds + frameIndex * secondsPerFrame),
  }))
  const distinctFrames = rawFrames.filter(
    (frame, frameIndex) => frameIndex === 0 || frame.label !== rawFrames[frameIndex - 1].label,
  )

  return distinctFrames.map((frame, frameIndex) => ({
    ...frame,
    showFromSeconds: frameIndex === 0 ? 0 : frame.showFromSeconds,
    hideAtSeconds: distinctFrames.at(frameIndex + 1)?.showFromSeconds ?? null,
  }))
}
