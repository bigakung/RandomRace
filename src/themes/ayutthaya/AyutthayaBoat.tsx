import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/** Distance from the bow (the group origin, which sits on the finish line at the end) to the stern. */
export const BOAT_LENGTH = 2.6
const BEAM = 0.5

type BoatParts = {
  hull: THREE.ExtrudeGeometry
  trim: THREE.BoxGeometry
  pavilion: THREE.BoxGeometry
  spire: THREE.ConeGeometry
  pole: THREE.CylinderGeometry
  flag: THREE.PlaneGeometry
  gold: THREE.MeshStandardMaterial
  lacquer: THREE.MeshStandardMaterial
  wood: THREE.MeshStandardMaterial
}

/** Side profile of a Thai long boat with the high, upswept bow and stern, bow tip at x = 0. */
function hullShape(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(-BOAT_LENGTH, 0.75)
  shape.quadraticCurveTo(-BOAT_LENGTH + 0.2, 0.05, -BOAT_LENGTH + 0.7, 0)
  shape.lineTo(-0.6, 0)
  shape.quadraticCurveTo(-0.1, 0.05, 0, 1.05)
  shape.lineTo(-0.12, 1.05)
  shape.quadraticCurveTo(-0.32, 0.32, -0.7, 0.28)
  shape.lineTo(-BOAT_LENGTH + 0.7, 0.28)
  shape.quadraticCurveTo(-BOAT_LENGTH + 0.25, 0.3, -BOAT_LENGTH + 0.1, 0.75)
  shape.closePath()
  return shape
}

// Shared by every boat for the lifetime of the page; created on first use.
let parts: BoatParts | null = null

function boatParts(): BoatParts {
  if (!parts) {
    const hull = new THREE.ExtrudeGeometry(hullShape(), {
      depth: BEAM,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 1,
      curveSegments: 6,
    })
    hull.translate(0, 0, -BEAM / 2)
    parts = {
      hull,
      trim: new THREE.BoxGeometry(1.35, 0.05, BEAM + 0.1),
      pavilion: new THREE.BoxGeometry(0.42, 0.26, 0.32),
      spire: new THREE.ConeGeometry(0.28, 0.5, 4),
      pole: new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5),
      flag: new THREE.PlaneGeometry(0.36, 0.22),
      gold: new THREE.MeshStandardMaterial({ color: '#e0b02a', metalness: 0.6, roughness: 0.35 }),
      lacquer: new THREE.MeshStandardMaterial({ color: '#8e2a1c', roughness: 0.6 }),
      wood: new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: 0.9 }),
    }
  }
  return parts
}

type AyutthayaBoatProps = {
  color: string
  castShadow: boolean
}

export function AyutthayaBoat({ color, castShadow }: AyutthayaBoatProps) {
  const shared = boatParts()
  const hullMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.55, flatShading: true }), [color])
  const flagMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.8 }),
    [color],
  )
  useEffect(
    () => () => {
      hullMaterial.dispose()
      flagMaterial.dispose()
    },
    [hullMaterial, flagMaterial],
  )

  return (
    <group>
      <mesh geometry={shared.hull} material={hullMaterial} castShadow={castShadow} dispose={null} />
      <mesh geometry={shared.trim} material={shared.gold} position={[-1.3, 0.3, 0]} dispose={null} />
      <mesh geometry={shared.pavilion} material={shared.lacquer} position={[-1.3, 0.45, 0]} castShadow={castShadow} dispose={null} />
      <mesh geometry={shared.spire} material={shared.gold} position={[-1.3, 0.83, 0]} rotation={[0, Math.PI / 4, 0]} dispose={null} />
      <mesh geometry={shared.pole} material={shared.wood} position={[-2.25, 0.95, 0]} dispose={null} />
      <mesh geometry={shared.flag} material={flagMaterial} position={[-2.07, 1.28, 0]} dispose={null} />
    </group>
  )
}
