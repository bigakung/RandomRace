import type { ComponentType } from 'react'
import type { LightingPreset, ThemeConfig } from '../themes/types'

export type VehicleModelProps = {
  color: string
  castShadow: boolean
}

export type EnvironmentProps = {
  courseHalfWidth: number
  detail: 'low' | 'full'
  castShadow: boolean
  /** False on low quality: scenery stays still (flags do not wave). */
  animated: boolean
}

export type SurfaceProps = {
  lighting: LightingPreset
  courseHalfWidth: number
  segments: number
  animated: boolean
}

/** What a Theme hands the 3D renderer. The renderer only knows Lanes and Vehicles, and reads
 * the ground only through `Surface`/`surfaceHeightAt` — never anything specific to a river or
 * any other terrain (ADR-0004). */
export type SceneTheme = {
  config: ThemeConfig
  Vehicle: ComponentType<VehicleModelProps>
  /** Bow-to-stern length; the Vehicle's origin is its front tip. */
  vehicleLength: number
  /** Scenery around the course, placed outside the widest Lane so it never touches one. */
  Environment: ComponentType<EnvironmentProps>
  /** The ground the Lanes run over (a river, a dirt track, …), spanning the same width the
   * camera and scenery are framed around. */
  Surface: ComponentType<SurfaceProps>
  /**
   * The ground's height at a point and time, in the same units as Vehicle motion — a wave
   * field for water, a constant for flat ground. Vehicles ride this so they never clip through
   * or float above the Surface; keep it in sync with whatever `Surface` itself renders.
   */
  surfaceHeightAt(x: number, z: number, seconds: number): number
}
