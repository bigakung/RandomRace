import { createElement } from 'react'
import { ThemeModel } from '../../three/assets/ThemeModel'
import type { SceneTheme, VehicleModelProps } from '../../three/sceneTheme'
import { elephantAssets } from './assets'
import { ElephantVehicle, ELEPHANT_LENGTH } from './ElephantVehicle'
import { ElephantEnvironment } from './scenery/ElephantEnvironment'
import { ElephantSurface } from './scenery/ElephantSurface'
import { elephantThemeConfig } from './themeConfig'

/** The procedural elephant, or a GLB elephant when one is configured (GLB elephants are not
 * tinted per Lane). */
function ThemeVehicle(props: VehicleModelProps) {
  return createElement(ThemeModel, { url: elephantAssets.vehicle, fallback: createElement(ElephantVehicle, props) })
}

export const elephantSceneTheme: SceneTheme = {
  config: elephantThemeConfig,
  Vehicle: ThemeVehicle,
  vehicleLength: ELEPHANT_LENGTH,
  Environment: ElephantEnvironment,
  Surface: ElephantSurface,
  // Flat ground: elephants neither bob nor tilt, unlike a boat riding a wave field.
  surfaceHeightAt: () => 0,
}
