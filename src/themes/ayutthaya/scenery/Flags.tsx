import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { InstancedPlacements } from '../../../three/scene/InstancedPlacements'
import { sceneryMaterials } from './materials'
import type { SceneryPlan } from './placement'

const POLE_HEIGHT = 5
const FLAG_WIDTH = 0.6
const FLAG_HEIGHT = 2.6
const FLAG_COLORS = ['#c0392b', '#e0b02a', '#f2ece0', '#c0392b', '#2f6b3a']

/** Tall hanging temple banners on poles; they ripple via a cheap vertex wave when animated. */
export function Flags({ flags, animated }: { flags: SceneryPlan['flags']; animated: boolean }) {
  const materials = sceneryMaterials()
  const time = useMemo(() => ({ value: 0 }), [])
  const geometries = useMemo(() => {
    const cloth = new THREE.PlaneGeometry(FLAG_WIDTH, FLAG_HEIGHT, 3, 8)
    // Hang from the top-left corner so the free edge and bottom sway most.
    cloth.translate(FLAG_WIDTH / 2, -FLAG_HEIGHT / 2, 0)
    return { pole: new THREE.CylinderGeometry(0.05, 0.07, POLE_HEIGHT, 5), cloth }
  }, [])
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  const clothMaterial = useMemo(() => {
    const material = materials.flag.clone()
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = time
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float sway = (transformed.x / ${FLAG_WIDTH.toFixed(2)}) + (-transformed.y / ${FLAG_HEIGHT.toFixed(2)}) * 0.6;
           transformed.z += sin(uTime * 2.4 + transformed.y * 2.0 + float(gl_InstanceID) * 1.3) * 0.18 * sway;`,
        )
    }
    return material
  }, [materials.flag, time])
  useEffect(() => () => clothMaterial.dispose(), [clothMaterial])

  useFrame(() => {
    if (animated) time.value = performance.now() / 1000
  })

  return (
    <group>
      <InstancedPlacements geometry={geometries.pole} material={materials.darkWood} placements={flags} offset={[0, POLE_HEIGHT / 2, 0]} />
      <InstancedPlacements
        geometry={geometries.cloth}
        material={clothMaterial}
        placements={flags}
        offset={[0.06, POLE_HEIGHT - 0.1, 0]}
        colors={FLAG_COLORS}
      />
    </group>
  )
}
