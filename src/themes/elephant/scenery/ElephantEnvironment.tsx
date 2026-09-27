import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { EnvironmentProps } from '../../../three/sceneTheme'
import { InstancedPlacements } from '../../../three/scene/InstancedPlacements'
import { elephantMaterials } from './materials'
import { planElephantScenery } from './placement'

const FOLIAGE_GREENS = ['#4f7a2e', '#5f8a34', '#3f6b2a', '#6d9440']
const POST_HEIGHT = 0.9

/** A small stretch of Thai countryside around the elephants' track: palms, a couple of nipa
 * huts, a wooden fence along both edges, and distant hills. */
export function ElephantEnvironment({ courseHalfWidth, detail, castShadow }: EnvironmentProps) {
  const plan = useMemo(() => planElephantScenery(courseHalfWidth, detail), [courseHalfWidth, detail])
  const materials = elephantMaterials()
  const geometries = useMemo(
    () => ({
      palmTrunk: new THREE.CylinderGeometry(0.1, 0.16, 4.2, 5),
      palmCrown: new THREE.ConeGeometry(1.5, 0.9, 7).rotateX(Math.PI),
      hutWall: new THREE.CylinderGeometry(1.6, 1.6, 1.6, 8, 1, true),
      hutRoof: new THREE.ConeGeometry(2, 1.6, 8),
      post: new THREE.CylinderGeometry(0.06, 0.08, POST_HEIGHT, 5),
      hill: new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  return (
    // Materials are shared for the page's lifetime; don't let unmounting dispose them.
    <group dispose={null}>
      <InstancedPlacements geometry={geometries.hill} material={materials.hill} placements={plan.hills} />
      <InstancedPlacements geometry={geometries.palmTrunk} material={materials.palmTrunk} placements={plan.palms} offset={[0, 2.1, 0]} />
      <InstancedPlacements
        geometry={geometries.palmCrown}
        material={materials.foliage}
        placements={plan.palms}
        offset={[0, 4.4, 0]}
        colors={FOLIAGE_GREENS}
        castShadow={castShadow}
      />
      <InstancedPlacements geometry={geometries.hutWall} material={materials.hutWall} placements={plan.huts} offset={[0, 0.8, 0]} castShadow={castShadow} />
      <InstancedPlacements geometry={geometries.hutRoof} material={materials.thatch} placements={plan.huts} offset={[0, 2.4, 0]} castShadow={castShadow} />
      <InstancedPlacements geometry={geometries.post} material={materials.postWood} placements={plan.fencePosts} offset={[0, POST_HEIGHT / 2, 0]} />
    </group>
  )
}
