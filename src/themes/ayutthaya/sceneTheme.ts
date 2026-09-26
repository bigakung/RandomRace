import { createElement } from 'react'
import { ThemeModel } from '../../three/assets/ThemeModel'
import type { SceneTheme, VehicleModelProps } from '../../three/sceneTheme'
import { ayutthayaAssets } from './assets'
import { AyutthayaBoat, BOAT_LENGTH } from './AyutthayaBoat'
import { AyutthayaEnvironment } from './scenery/AyutthayaEnvironment'
import { ayutthayaThemeConfig } from './themeConfig'

/** The traditional boat, or a GLB boat when one is configured (GLB boats are not tinted per Lane). */
function AyutthayaVehicle(props: VehicleModelProps) {
  return createElement(ThemeModel, { url: ayutthayaAssets.vehicle, fallback: createElement(AyutthayaBoat, props) })
}

export const ayutthayaSceneTheme: SceneTheme = {
  config: ayutthayaThemeConfig,
  Vehicle: AyutthayaVehicle,
  vehicleLength: BOAT_LENGTH,
  Environment: AyutthayaEnvironment,
}
