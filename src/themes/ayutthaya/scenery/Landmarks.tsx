import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { ThemeModel } from '../../../three/assets/ThemeModel'
import { ayutthayaAssets } from '../assets'
import { CHEDI_HEIGHT, CHEDI_PROFILE, PRANG_HEIGHT, PRANG_PROFILE, gableRoof, lathe } from './geometry'
import { sceneryMaterials } from './materials'
import type { SceneryPlan } from './placement'

type LandmarkGeometries = ReturnType<typeof createGeometries>

function createGeometries() {
  return {
    prang: lathe(PRANG_PROFILE, 8),
    chedi: lathe(CHEDI_PROFILE, 14),
    finial: new THREE.ConeGeometry(0.14, 1.4, 6),
    platform: new THREE.BoxGeometry(8, 1, 8),
    hallPlinth: new THREE.BoxGeometry(10.5, 0.7, 5.6),
    hallBody: new THREE.BoxGeometry(9, 2.6, 4.2),
    roofs: [gableRoof(10.6, 5.8, 2.2), gableRoof(8, 4.6, 2.6), gableRoof(5.4, 3.4, 3)],
    chofa: new THREE.ConeGeometry(0.16, 1.1, 5),
  }
}

function Prang({ geometries }: { geometries: LandmarkGeometries }) {
  const materials = sceneryMaterials()
  return (
    <group>
      <mesh geometry={geometries.platform} material={materials.laterite} position-y={0.5} castShadow receiveShadow />
      <mesh geometry={geometries.prang} material={materials.laterite} position-y={1} castShadow />
      <mesh geometry={geometries.finial} material={materials.gold} position-y={1 + PRANG_HEIGHT + 0.5} />
    </group>
  )
}

function Chedi({ geometries }: { geometries: LandmarkGeometries }) {
  const materials = sceneryMaterials()
  return (
    <group>
      <mesh geometry={geometries.chedi} material={materials.whitewash} castShadow />
      <mesh geometry={geometries.finial} material={materials.gold} position-y={CHEDI_HEIGHT + 0.4} />
    </group>
  )
}

/** Ordination hall with three stacked gable roofs and gold chofa finials on each ridge end. */
function TempleHall({ geometries }: { geometries: LandmarkGeometries }) {
  const materials = sceneryMaterials()
  const tiers = [
    { y: 3.3, length: 10.6, height: 2.2, material: materials.roofRed },
    { y: 4.1, length: 8, height: 2.6, material: materials.roofGreen },
    { y: 4.9, length: 5.4, height: 3, material: materials.roofRed },
  ]
  return (
    <group>
      <mesh geometry={geometries.hallPlinth} material={materials.plinth} position-y={0.35} receiveShadow />
      <mesh geometry={geometries.hallBody} material={materials.stucco} position-y={2} castShadow />
      {tiers.map((tier, index) => (
        <group key={index} position-y={tier.y}>
          <mesh geometry={geometries.roofs[index]} material={tier.material} castShadow />
          {[-1, 1].map((end) => (
            <mesh
              key={end}
              geometry={geometries.chofa}
              material={materials.gold}
              position={[(end * tier.length) / 2, tier.height + 0.3, 0]}
              rotation-z={-end * 0.5}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

/** The temples behind the city wall; each can be replaced by a GLB model via the asset config. */
export function Landmarks({ temples }: { temples: SceneryPlan['temples'] }) {
  const geometries = useMemo(() => createGeometries(), [])
  useEffect(
    () => () => {
      const { roofs, ...rest } = geometries
      ;[...roofs, ...Object.values(rest)].forEach((geometry) => geometry.dispose())
    },
    [geometries],
  )

  return (
    <group>
      {temples.map((temple, index) => {
        const procedural =
          temple.kind === 'prang' ? (
            <Prang geometries={geometries} />
          ) : temple.kind === 'chedi' ? (
            <Chedi geometries={geometries} />
          ) : (
            <TempleHall geometries={geometries} />
          )
        const slot = temple.kind === 'hall' ? 'temple' : temple.kind
        return (
          <group
            key={index}
            position={[temple.x, 0.2, temple.z]}
            rotation-y={temple.rotationY}
            scale={temple.scale}
          >
            <ThemeModel url={ayutthayaAssets[slot]} fallback={procedural} />
          </group>
        )
      })}
    </group>
  )
}

/** Flat, fog-tinted temple outlines on the horizon to give the city depth. */
export function Silhouettes({ silhouettes }: { silhouettes: SceneryPlan['silhouettes'] }) {
  const geometries = useMemo(
    () => ({ prang: lathe(PRANG_PROFILE, 6), chedi: lathe(CHEDI_PROFILE, 8) }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])
  const material = sceneryMaterials().silhouette
  return (
    <group>
      {silhouettes.map((silhouette, index) => (
        <mesh
          key={index}
          geometry={geometries[silhouette.kind === 'prang' ? 'prang' : 'chedi']}
          material={material}
          position={[silhouette.x, -1, silhouette.z]}
          scale={silhouette.scale}
        />
      ))}
    </group>
  )
}
