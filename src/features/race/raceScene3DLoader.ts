import { lazy } from 'react'

const loadRaceScene3D = () => import('../../three/RaceScene3D')

/** The 3D Race lives in its own chunk so the Roster screen stays light. */
export const RaceScene3D = lazy(loadRaceScene3D)

/** Starts downloading the 3D chunk early (while names are typed); failures surface later at render. */
export function preloadRaceScene3D() {
  loadRaceScene3D().catch(() => undefined)
}
