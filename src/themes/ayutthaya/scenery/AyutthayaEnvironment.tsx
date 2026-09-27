import { useMemo } from 'react'
import type { EnvironmentProps } from '../../../three/sceneTheme'
import { Flags } from './Flags'
import { Landmarks, Silhouettes } from './Landmarks'
import { planScenery } from './placement'
import { Bridge, CityWall, ThaiHouses, Vegetation } from './Settlement'

/** A small reconstructed stretch of Ayutthaya around the race course. */
export function AyutthayaEnvironment({ courseHalfWidth, detail, castShadow, animated }: EnvironmentProps) {
  const plan = useMemo(() => planScenery(courseHalfWidth, detail), [courseHalfWidth, detail])
  return (
    // Materials are shared for the page's lifetime; don't let unmounting dispose them.
    <group dispose={null}>
      <Silhouettes silhouettes={plan.silhouettes} />
      <Landmarks temples={plan.temples} />
      <CityWall wall={plan.wall} towers={plan.towers} />
      <ThaiHouses houses={plan.houses} castShadow={castShadow} />
      <Vegetation palms={plan.palms} trees={plan.trees} castShadow={castShadow} />
      <Flags flags={plan.flags} animated={animated} />
      <Bridge bridge={plan.bridge} />
    </group>
  )
}
