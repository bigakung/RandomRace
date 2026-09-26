export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night'

/** Everything a time of day changes in the 3D scene. New moods are new presets, not new code. */
export type LightingPreset = {
  skyTop: string
  skyHorizon: string
  sunColor: string
  sunIntensity: number
  /** Direction towards the sun (need not be normalised). */
  sunDirection: readonly [number, number, number]
  hemisphereSky: string
  hemisphereGround: string
  hemisphereIntensity: number
  ambientIntensity: number
  fogColor: string
  water: string
  riverbed: string
  bank: string
}

export type ThemeConfig = {
  id: string
  name: string
  /** Cycled per Lane so neighbouring Vehicles are easy to tell apart. */
  vehicleColors: readonly string[]
  defaultTimeOfDay: TimeOfDay
  lighting: Partial<Record<TimeOfDay, LightingPreset>>
}
