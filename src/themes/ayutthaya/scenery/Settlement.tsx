import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { InstancedPlacements } from '../../../three/scene/InstancedPlacements'
import { gableRoof } from './geometry'
import { sceneryMaterials } from './materials'
import type { SceneryPlan } from './placement'

const STILT_HEIGHT = 1.4
const STILT_CORNERS: readonly (readonly [number, number, number])[] = [
  [-0.9, STILT_HEIGHT / 2, -0.7],
  [0.9, STILT_HEIGHT / 2, -0.7],
  [-0.9, STILT_HEIGHT / 2, 0.7],
  [0.9, STILT_HEIGHT / 2, 0.7],
]
const WALL_HEIGHT = 3
const CRENEL_SPACING = 1.6

/** Raised Thai houses on stilts along the far bank, instanced part by part. */
export function ThaiHouses({ houses, castShadow }: { houses: SceneryPlan['houses']; castShadow: boolean }) {
  const materials = sceneryMaterials()
  const geometries = useMemo(
    () => ({
      stilt: new THREE.CylinderGeometry(0.08, 0.08, STILT_HEIGHT, 5),
      body: new THREE.BoxGeometry(2.2, 1.2, 1.8),
      roof: gableRoof(2.9, 2.6, 1.7),
    }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  return (
    <group>
      {STILT_CORNERS.map((corner, index) => (
        <InstancedPlacements key={index} geometry={geometries.stilt} material={materials.darkWood} placements={houses} offset={corner} />
      ))}
      <InstancedPlacements
        geometry={geometries.body}
        material={materials.teak}
        placements={houses}
        offset={[0, STILT_HEIGHT + 0.6, 0]}
        castShadow={castShadow}
      />
      <InstancedPlacements
        geometry={geometries.roof}
        material={materials.darkWood}
        placements={houses}
        offset={[0, STILT_HEIGHT + 1.2, 0]}
        castShadow={castShadow}
      />
    </group>
  )
}

/** Brick city wall with merlons, and watchtowers with tiled roofs. */
export function CityWall({ wall, towers }: Pick<SceneryPlan, 'wall' | 'towers'>) {
  const materials = sceneryMaterials()
  const geometries = useMemo(
    () => ({
      wall: new THREE.BoxGeometry(wall.length, WALL_HEIGHT, wall.halfThickness * 2),
      merlon: new THREE.BoxGeometry(0.7, 0.7, wall.halfThickness * 2 + 0.1),
      tower: new THREE.BoxGeometry(3.4, 5, 3.2),
      towerRoof: gableRoof(3.8, 3.6, 2.2),
    }),
    [wall.length, wall.halfThickness],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  const merlons = useMemo(() => {
    const count = Math.floor(wall.length / CRENEL_SPACING)
    return Array.from({ length: count }, (_, i) => ({
      x: -wall.length / 2 + (i + 0.5) * CRENEL_SPACING,
      z: wall.z,
      rotationY: 0,
      scale: 1,
    }))
  }, [wall.length, wall.z])

  return (
    <group>
      <mesh geometry={geometries.wall} material={materials.brick} position={[0, WALL_HEIGHT / 2 - 0.3, wall.z]} receiveShadow />
      <InstancedPlacements geometry={geometries.merlon} material={materials.brick} placements={merlons} offset={[0, WALL_HEIGHT - 0.3 + 0.35, 0]} />
      <InstancedPlacements geometry={geometries.tower} material={materials.brick} placements={towers} offset={[0, 2.2, 0]} />
      <InstancedPlacements geometry={geometries.towerRoof} material={materials.roofRed} placements={towers} offset={[0, 4.7, 0]} />
    </group>
  )
}

const FOLIAGE_GREENS = ['#4f7a2e', '#5f8a34', '#3f6b2a', '#6d9440']

/** Sugar palms and round-crowned trees, each species drawn in two instanced calls. */
export function Vegetation({ palms, trees, castShadow }: Pick<SceneryPlan, 'palms' | 'trees'> & { castShadow: boolean }) {
  const materials = sceneryMaterials()
  const geometries = useMemo(
    () => ({
      palmTrunk: new THREE.CylinderGeometry(0.12, 0.2, 5, 5),
      palmCrown: new THREE.ConeGeometry(1.8, 1, 7).rotateX(Math.PI),
      treeTrunk: new THREE.CylinderGeometry(0.18, 0.26, 1.8, 5),
      treeCrown: new THREE.IcosahedronGeometry(1.7, 0),
    }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  return (
    <group>
      <InstancedPlacements geometry={geometries.palmTrunk} material={materials.palmTrunk} placements={palms} offset={[0, 2.5, 0]} />
      <InstancedPlacements
        geometry={geometries.palmCrown}
        material={materials.foliage}
        placements={palms}
        offset={[0, 5.1, 0]}
        colors={FOLIAGE_GREENS}
        castShadow={castShadow}
      />
      <InstancedPlacements geometry={geometries.treeTrunk} material={materials.palmTrunk} placements={trees} offset={[0, 0.9, 0]} />
      <InstancedPlacements
        geometry={geometries.treeCrown}
        material={materials.foliage}
        placements={trees}
        offset={[0, 2.9, 0]}
        colors={FOLIAGE_GREENS}
        castShadow={castShadow}
      />
    </group>
  )
}

/** A gently arched wooden footbridge across the river, beyond the finish line. */
export function Bridge({ bridge }: Pick<SceneryPlan, 'bridge'>) {
  const materials = sceneryMaterials()
  const segments = 18
  const rise = Math.min(3, 1 + bridge.span * 0.04)
  const planks = useMemo(
    () =>
      Array.from({ length: segments }, (_, i) => {
        const t = (i + 0.5) / segments
        const slope = Math.cos(Math.PI * t) * Math.PI * (rise / bridge.span)
        return { z: -bridge.span / 2 + t * bridge.span, y: 0.6 + rise * Math.sin(Math.PI * t), tilt: slope }
      }),
    [bridge.span, rise],
  )
  const plankLength = bridge.span / segments + 0.05

  return (
    <group position-x={bridge.x}>
      {planks.map((plank, index) => (
        <group key={index} position={[0, plank.y, plank.z]} rotation-x={-plank.tilt}>
          <mesh material={materials.teak} castShadow>
            <boxGeometry args={[bridge.halfWidth * 2, 0.2, plankLength]} />
          </mesh>
          {index % 3 === 0 &&
            [-1, 1].map((side) => (
              <mesh key={side} material={materials.roofRed} position={[side * bridge.halfWidth, 0.5, 0]}>
                <boxGeometry args={[0.12, 1, 0.12]} />
              </mesh>
            ))}
        </group>
      ))}
      {planks
        .filter((_, index) => index % 4 === 2)
        .map((plank, index) => (
          <mesh key={index} material={materials.darkWood} position={[0, plank.y / 2 - 0.5, plank.z]}>
            <cylinderGeometry args={[0.2, 0.25, plank.y + 1, 6]} />
          </mesh>
        ))}
    </group>
  )
}
