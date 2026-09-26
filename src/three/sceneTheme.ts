import type { ComponentType } from 'react'
import type { ThemeConfig } from '../themes/types'

export type VehicleModelProps = {
  color: string
  castShadow: boolean
}

export type EnvironmentProps = {
  riverHalfWidth: number
  detail: 'low' | 'full'
  castShadow: boolean
  /** False on low quality: scenery stays still (flags do not wave). */
  animated: boolean
}

/** What a Theme hands the 3D renderer. The renderer only knows Lanes and Vehicles, never boats. */
export type SceneTheme = {
  config: ThemeConfig
  Vehicle: ComponentType<VehicleModelProps>
  /** Bow-to-stern length; the Vehicle's origin is its front tip. */
  vehicleLength: number
  /** Scenery around the river, placed outside the widest river so it never touches a Lane. */
  Environment: ComponentType<EnvironmentProps>
}
