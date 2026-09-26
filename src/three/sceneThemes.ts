import type { ThemeId } from '../themes/registry'
import { ayutthayaSceneTheme } from '../themes/ayutthaya/sceneTheme'
import type { SceneTheme } from './sceneTheme'

/** 3D half of each Theme, loaded only with the 3D chunk. */
export const sceneThemes: Record<ThemeId, SceneTheme> = {
  ayutthaya: ayutthayaSceneTheme,
}
