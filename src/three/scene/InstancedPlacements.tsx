import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

export type InstancePlacement = {
  x: number
  z: number
  rotationY: number
  scale: number
}

type InstancedPlacementsProps = {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  placements: readonly InstancePlacement[]
  /** Offset of this part inside each placement, before scaling (e.g. a canopy above its trunk). */
  offset?: readonly [number, number, number]
  /** Optional per-instance tint; needs a material with a white base colour. */
  colors?: readonly string[]
  castShadow?: boolean
}

const NO_OFFSET = [0, 0, 0] as const

/** Draws one part (e.g. every palm trunk) for many placements in a single draw call. */
export function InstancedPlacements({
  geometry,
  material,
  placements,
  offset = NO_OFFSET,
  colors,
  castShadow = false,
}: InstancedPlacementsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const instanced = mesh.current
    if (!instanced) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const rotation = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    const color = new THREE.Color()
    placements.forEach((placement, index) => {
      rotation.setFromAxisAngle(up, placement.rotationY)
      position.set(...offset).multiplyScalar(placement.scale).applyQuaternion(rotation)
      position.x += placement.x
      position.z += placement.z
      scale.setScalar(placement.scale)
      instanced.setMatrixAt(index, matrix.compose(position, rotation, scale))
      if (colors && colors.length > 0) instanced.setColorAt(index, color.set(colors[index % colors.length] ?? '#ffffff'))
    })
    instanced.instanceMatrix.needsUpdate = true
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true
    instanced.computeBoundingSphere()
  }, [placements, offset, colors])

  if (placements.length === 0) return null
  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow
      dispose={null}
    />
  )
}
