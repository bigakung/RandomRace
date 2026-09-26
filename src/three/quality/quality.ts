export type QualityLevel = 'low' | 'medium' | 'high'

/** What changes between quality levels. Quality only ever changes visuals, never the Race. */
export type QualitySettings = {
  maxPixelRatio: number
  shadows: boolean
  waterSegments: number
  animatedWater: boolean
  sceneryDetail: 'low' | 'full'
  /** Gold sparkles + confetti around the Winner. */
  celebrationParticles: number
}

export const qualitySettings: Record<QualityLevel, QualitySettings> = {
  low: { maxPixelRatio: 1, shadows: false, waterSegments: 48, animatedWater: false, sceneryDetail: 'low', celebrationParticles: 60 },
  medium: { maxPixelRatio: 1.5, shadows: true, waterSegments: 120, animatedWater: true, sceneryDetail: 'full', celebrationParticles: 240 },
  high: { maxPixelRatio: 2, shadows: true, waterSegments: 200, animatedWater: true, sceneryDetail: 'full', celebrationParticles: 400 },
}

export type DeviceSignals = {
  coarsePointer?: boolean
  shortestScreenSide?: number
  cores?: number
  memoryGb?: number
}

const PHONE_SCREEN_SIDE = 768
const WEAK_CORES = 4
const WEAK_MEMORY_GB = 4

/** Starting quality: low for phones and weak hardware, medium otherwise. High is never auto-selected. */
export function chooseQuality({ coarsePointer, shortestScreenSide, cores, memoryGb }: DeviceSignals): QualityLevel {
  const phone = coarsePointer === true && shortestScreenSide !== undefined && shortestScreenSide < PHONE_SCREEN_SIDE
  const weak = (cores !== undefined && cores <= WEAK_CORES) || (memoryGb !== undefined && memoryGb <= WEAK_MEMORY_GB)
  return phone || weak ? 'low' : 'medium'
}

export function lowerQuality(level: QualityLevel): QualityLevel {
  return level === 'high' ? 'medium' : 'low'
}

export function readDeviceSignals(): DeviceSignals {
  // `deviceMemory` is Chromium-only and missing from the DOM typings.
  const { hardwareConcurrency, deviceMemory } = navigator as Navigator & { deviceMemory?: number }
  return {
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches,
    shortestScreenSide: Math.min(window.screen.width, window.screen.height),
    cores: hardwareConcurrency || undefined,
    memoryGb: deviceMemory,
  }
}
