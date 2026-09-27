import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/** Distance from the trunk tip (the group origin, which sits on the finish line at the end) to the tail. */
export const ELEPHANT_LENGTH = 2.4
const BODY_WIDTH = 0.9

type ElephantParts = {
  body: THREE.CapsuleGeometry
  head: THREE.BoxGeometry
  ear: THREE.CircleGeometry
  trunkUpper: THREE.CylinderGeometry
  trunkLower: THREE.CylinderGeometry
  tuskGeometry: THREE.ConeGeometry
  leg: THREE.CylinderGeometry
  tail: THREE.CylinderGeometry
  howdah: THREE.BoxGeometry
  pole: THREE.CylinderGeometry
  flag: THREE.PlaneGeometry
  skin: THREE.MeshStandardMaterial
  tusk: THREE.MeshStandardMaterial
  gold: THREE.MeshStandardMaterial
  wood: THREE.MeshStandardMaterial
}

// Shared by every elephant for the lifetime of the page; created on first use.
let parts: ElephantParts | null = null

function elephantParts(): ElephantParts {
  if (!parts) {
    const body = new THREE.CapsuleGeometry(BODY_WIDTH / 2, ELEPHANT_LENGTH - BODY_WIDTH, 3, 8)
    body.rotateZ(Math.PI / 2)
    parts = {
      body,
      head: new THREE.BoxGeometry(0.5, 0.55, 0.62),
      ear: new THREE.CircleGeometry(0.34, 10),
      trunkUpper: new THREE.CylinderGeometry(0.09, 0.11, 0.38, 6),
      trunkLower: new THREE.CylinderGeometry(0.05, 0.09, 0.32, 6),
      tuskGeometry: new THREE.ConeGeometry(0.045, 0.32, 5),
      leg: new THREE.CylinderGeometry(0.14, 0.17, 0.62, 6),
      tail: new THREE.CylinderGeometry(0.02, 0.04, 0.5, 5),
      howdah: new THREE.BoxGeometry(0.62, 0.3, 0.7),
      pole: new THREE.CylinderGeometry(0.015, 0.015, 0.6, 5),
      flag: new THREE.PlaneGeometry(0.3, 0.2),
      skin: new THREE.MeshStandardMaterial({ color: '#8f8b86', roughness: 0.85, flatShading: true }),
      tusk: new THREE.MeshStandardMaterial({ color: '#f2ead9', roughness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: '#e0b02a', metalness: 0.6, roughness: 0.35 }),
      wood: new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: 0.9 }),
    }
  }
  return parts
}

type ElephantVehicleProps = {
  color: string
  castShadow: boolean
}

/** A calm, family-friendly low-poly elephant with a decorated riding howdah in the Lane colour. */
export function ElephantVehicle({ color, castShadow }: ElephantVehicleProps) {
  const shared = elephantParts()
  const howdahMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true }), [color])
  const flagMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.8 }),
    [color],
  )
  useEffect(
    () => () => {
      howdahMaterial.dispose()
      flagMaterial.dispose()
    },
    [howdahMaterial, flagMaterial],
  )

  const bodyY = 0.62
  const legY = bodyY - 0.5

  return (
    <group>
      <mesh geometry={shared.body} material={shared.skin} position={[-ELEPHANT_LENGTH / 2, bodyY, 0]} castShadow={castShadow} dispose={null} />
      <mesh geometry={shared.head} material={shared.skin} position={[-0.28, bodyY + 0.02, 0]} castShadow={castShadow} dispose={null} />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={shared.ear}
          material={shared.skin}
          position={[-0.16, bodyY + 0.14, side * 0.32]}
          rotation={[0, side > 0 ? -Math.PI / 2.4 : Math.PI / 2.4, 0]}
          dispose={null}
        />
      ))}
      <mesh
        geometry={shared.trunkUpper}
        material={shared.skin}
        position={[0.06, bodyY - 0.12, 0]}
        rotation={[0, 0, -Math.PI / 10]}
        dispose={null}
      />
      <mesh
        geometry={shared.trunkLower}
        material={shared.skin}
        position={[0.16, bodyY - 0.42, 0]}
        rotation={[0, 0, Math.PI / 12]}
        dispose={null}
      />
      {[-0.16, 0.16].map((z) => (
        <mesh
          key={z}
          geometry={shared.tuskGeometry}
          material={shared.tusk}
          position={[-0.02, bodyY - 0.14, z]}
          rotation={[0, 0, -Math.PI / 3]}
          dispose={null}
        />
      ))}
      {[-0.32, 0.32].map((z) =>
        [-ELEPHANT_LENGTH + 0.75, -0.75].map((x) => (
          <mesh key={`${x}-${z}`} geometry={shared.leg} material={shared.skin} position={[x, legY, z]} castShadow={castShadow} dispose={null} />
        )),
      )}
      <mesh geometry={shared.tail} material={shared.skin} position={[-ELEPHANT_LENGTH + 0.15, bodyY + 0.05, 0]} rotation={[0, 0, Math.PI / 2.3]} dispose={null} />
      <mesh geometry={shared.howdah} material={howdahMaterial} position={[-1.3, bodyY + 0.5, 0]} castShadow={castShadow} dispose={null} />
      <mesh geometry={shared.pole} material={shared.wood} position={[-1.3, bodyY + 0.95, 0]} dispose={null} />
      <mesh geometry={shared.flag} material={flagMaterial} position={[-1.14, bodyY + 1.2, 0]} dispose={null} />
    </group>
  )
}
