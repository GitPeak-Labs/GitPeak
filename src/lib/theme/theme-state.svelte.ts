import { getSavedPresetName } from './theme-manager'

let presetName = $state<string | null>(typeof window === 'undefined' ? null : getSavedPresetName())

export function getActivePresetName(): string | null {
  return presetName
}

export function setActivePresetName(name: string | null): void {
  presetName = name
}
