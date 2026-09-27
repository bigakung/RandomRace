import { createElement } from 'react'
import { waveHeight } from '../../three/effects/water'
import { ThemeModel } from '../../three/assets/ThemeModel'
import type { SceneTheme, VehicleModelProps } from '../../three/sceneTheme'
import { ayutthayaAssets } from './assets'
import { AyutthayaBoat, BOAT_LENGTH } from './AyutthayaBoat'
import { AyutthayaEnvironment } from './scenery/AyutthayaEnvironment'
import { AyutthayaSurface } from './scenery/AyutthayaSurface'
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
  Surface: AyutthayaSurface,
  // Boats ride the same wave field the water shader draws (River.tsx's old comment, now here).
  surfaceHeightAt: waveHeight,
}
